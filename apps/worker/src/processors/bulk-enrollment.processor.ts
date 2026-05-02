import type { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@repo/db";
import { BackGroundJobStatus, MemberRole, UserRole } from "@repo/db";
import type {
	BulkEnrollmentFilePayload,
	BulkEnrollmentJobResult,
} from "@repo/shared";
import { parseBulkEnrollmentCsv } from "../parser/parse-bulk-enrollment-csv.js";
import { deleteFile, getFileBuffer } from "../s3.js";
import type {
	BulkEnrollmentJobPayload,
	BulkEnrollUserPayload,
} from "./types.js";

const BATCH_SIZE = 50;

const FAILED_JOB_RESULT = {
	enrolled: 0,
	skipped: 0,
	failed: 0,
	errors: [] as Array<{ row: number; email?: string; message: string }>,
};

function toFailedResult(err: unknown, failedCount = 0): object {
	const message = err instanceof Error ? err.message : "Job failed";
	return {
		...FAILED_JOB_RESULT,
		failed: failedCount,
		errors: [{ row: 0, message }],
	};
}

export async function runBulkEnrollmentProcessor(
	prisma: PrismaClient,
	s3: S3Client,
	bucket: string,
	payload: BulkEnrollmentFilePayload,
): Promise<void> {
	const { jobId, s3Key } = payload;

	let buffer: Buffer;
	try {
		buffer = await getFileBuffer(s3, bucket, s3Key);
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: toFailedResult(err) as object,
				completedAt: new Date(),
			},
		});
		throw err;
	}

	let users: ReturnType<typeof parseBulkEnrollmentCsv>;
	try {
		users = parseBulkEnrollmentCsv(buffer);
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: toFailedResult(err) as object,
				completedAt: new Date(),
			},
		});
		throw err;
	}

	try {
		await processBulkEnrollment(prisma, {
			jobId: payload.jobId,
			organizationId: payload.organizationId,
			users,
		});
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: toFailedResult(err, users.length) as object,
				completedAt: new Date(),
			},
		});
		throw err;
	} finally {
		try {
			await deleteFile(s3, bucket, s3Key);
		} catch {
			// best-effort delete
		}
	}
}

type BatchRow = {
	rowIndex: number;
	user: BulkEnrollUserPayload;
	email: string;
};

type ToEnrollRow = BatchRow & { existingUserId: string | null };

export async function processBulkEnrollment(
	prisma: PrismaClient,
	payload: BulkEnrollmentJobPayload,
): Promise<BulkEnrollmentJobResult> {
	const { jobId, organizationId, users } = payload;
	const result: BulkEnrollmentJobResult = {
		enrolled: 0,
		skipped: 0,
		failed: 0,
		errors: [],
	};

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});

	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true },
	});
	if (!org) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: result as object,
				completedAt: new Date(),
			},
		});
		result.errors.push({ row: 0, message: "Organization not found" });
		result.failed = users.length;
		return result;
	}

	// Track duplicate emails within file (bounded by file size)
	const seenEmails = new Set<string>();

	for (let i = 0; i < users.length; i += BATCH_SIZE) {
		const batch = users.slice(i, i + BATCH_SIZE);
		const batchRows: BatchRow[] = [];

		for (let j = 0; j < batch.length; j++) {
			const rowIndex = i + j + 1;
			const u = batch[j];
			if (!u) continue;
			const rawEmail = u.email?.trim();
			if (!rawEmail) {
				result.failed += 1;
				result.errors.push({ row: rowIndex, message: "Email is required" });
				continue;
			}
			const email = rawEmail.toLowerCase();
			if (seenEmails.has(email)) {
				result.skipped += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: "Duplicate email in file",
				});
				continue;
			}
			seenEmails.add(email);
			batchRows.push({ rowIndex, user: u, email });
		}

		if (batchRows.length === 0) continue;

		const emails = batchRows.map((r) => r.email);

		// One read: existing users by email (id + email only)
		const existingUsers = await prisma.user.findMany({
			where: { email: { in: emails } },
			select: { id: true, email: true },
		});
		const existingUserByEmail = new Map(
			existingUsers.map((u) => [u.email.toLowerCase(), u.id]),
		);
		const existingUserIds = existingUsers.map((u) => u.id);
		if (existingUserIds.length === 0) {
			// No existing users; all batchRows are new users. Still need to check members for empty set.
		}

		// One read: existing members in this org for those user ids
		const existingMembers =
			existingUserIds.length > 0
				? await prisma.member.findMany({
						where: {
							organizationId,
							userId: { in: existingUserIds },
						},
						select: { userId: true },
					})
				: [];
		const alreadyMemberIds = new Set(existingMembers.map((m) => m.userId));

		const toEnroll: ToEnrollRow[] = [];
		for (const row of batchRows) {
			const existingUserId = existingUserByEmail.get(row.email) ?? null;
			if (existingUserId !== null && alreadyMemberIds.has(existingUserId)) {
				result.skipped += 1;
				result.errors.push({
					row: row.rowIndex,
					email: row.email,
					message: "User already enrolled in this organization",
				});
				continue;
			}
			toEnroll.push({
				...row,
				existingUserId,
			});
		}

		if (toEnroll.length === 0) continue;

		try {
			await prisma.$transaction(async (tx) => {
				const userIds: string[] = [];
				for (const entry of toEnroll) {
					if (entry.existingUserId !== null) {
						userIds.push(entry.existingUserId);
					} else {
						const user = await tx.user.create({
							data: {
								name:
									`${(entry.user.firstName ?? "").trim()} ${(entry.user.lastName ?? "").trim()}`.trim() ||
									entry.email,
								email: entry.email,
								role: UserRole.ORGANIZATION_USER,
								title: (entry.user.title ?? "").trim() || null,
								officePhone: entry.user.officePhone?.trim() || null,
								phoneNumber: entry.user.phoneNumber?.trim() || null,
							},
						});
						userIds.push(user.id);
					}
				}
				for (let k = 0; k < toEnroll.length; k++) {
					// userIds.length === toEnroll.length by construction
					const userId = userIds[k];
					const row = toEnroll[k];
					if (!userId || !row) continue;
					await tx.member.create({
						data: {
							userId,
							organizationId,
							role: validateMemberRole(row.user.role),
						},
					});
				}
			});
			result.enrolled += toEnroll.length;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			const first = toEnroll[0];
			const last = toEnroll[toEnroll.length - 1];
			const startRow = first?.rowIndex ?? i + 1;
			const endRow = last?.rowIndex ?? i + batchRows.length;
			result.failed += toEnroll.length;
			result.errors.push({
				row: startRow,
				message: `Batch rows ${startRow}–${endRow} failed: ${message}`,
			});
		}
	}

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: {
			status: BackGroundJobStatus.COMPLETED,
			result: result as object,
			completedAt: new Date(),
		},
	});

	return result;
}

function validateMemberRole(role: string): MemberRole {
	const r = (role ?? "").trim().toUpperCase();
	if (
		r === MemberRole.EXECUTIVE ||
		r === MemberRole.HIRING_MANAGER ||
		r === MemberRole.OPERATIONS
	) {
		return r as MemberRole;
	}
	return MemberRole.OPERATIONS;
}

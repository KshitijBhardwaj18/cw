import type { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@repo/db";
import { BackGroundJobStatus, UserRole, UserStatus } from "@repo/db";
import type {
	BulkPlatformUsersFilePayload,
	BulkPlatformUsersJobResult,
} from "@repo/shared";
import { parseBulkPlatformUsersCsv } from "../parser/parse-bulk-platform-users-csv.js";
import { deleteFile, getFileBuffer } from "../s3.js";
import type { BulkPlatformUserRow } from "./types.js";

const BATCH_SIZE = 50;

const PLATFORM_ROLES = new Set<string>([
	UserRole.GENERAL_ADMIN,
	UserRole.PROGRAM_MANAGER,
	UserRole.COMPLIANCE_MANAGER,
	UserRole.SUPER_ADMIN,
]);

const VALID_STATUSES = new Set<string>([
	UserStatus.ACTIVE,
	UserStatus.INACTIVE,
]);

const FAILED_JOB_RESULT: BulkPlatformUsersJobResult = {
	created: 0,
	skipped: 0,
	failed: 0,
	errors: [],
};

function toFailedResult(err: unknown, failedCount = 0): object {
	const message = err instanceof Error ? err.message : "Job failed";
	return {
		...FAILED_JOB_RESULT,
		failed: failedCount,
		errors: [{ row: 0, message }],
	};
}

function validateRole(role: string): role is UserRole {
	return PLATFORM_ROLES.has(role?.trim() ?? "");
}

function validateStatus(status: string): status is UserStatus {
	return VALID_STATUSES.has(status?.trim() ?? "");
}

export async function runBulkPlatformUsersProcessor(
	prisma: PrismaClient,
	s3: S3Client,
	bucket: string,
	payload: BulkPlatformUsersFilePayload,
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

	let rows: BulkPlatformUserRow[];
	try {
		rows = parseBulkPlatformUsersCsv(buffer);
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
		await processBulkPlatformUsers(prisma, jobId, rows);
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: toFailedResult(err, rows.length) as object,
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

async function processBulkPlatformUsers(
	prisma: PrismaClient,
	jobId: string,
	rows: BulkPlatformUserRow[],
): Promise<BulkPlatformUsersJobResult> {
	const result: BulkPlatformUsersJobResult = {
		created: 0,
		skipped: 0,
		failed: 0,
		errors: [],
	};

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});

	const allEmailsInFile = [
		...new Set(
			rows
				.map((r) => r.email?.trim().toLowerCase())
				.filter((e): e is string => Boolean(e)),
		),
	];
	const existingUsers = await prisma.user.findMany({
		where: { email: { in: allEmailsInFile } },
		select: { email: true },
	});
	const existingUserEmails = new Set(existingUsers.map((u) => u.email));

	const seenEmails = new Set<string>();

	for (let i = 0; i < rows.length; i += BATCH_SIZE) {
		const batch = rows.slice(i, i + BATCH_SIZE);

		for (let j = 0; j < batch.length; j++) {
			const rowIndex = i + j + 1;
			const row = batch[j];
			if (!row) continue;

			const email = row.email?.trim().toLowerCase();
			if (!email) {
				result.failed += 1;
				result.errors.push({ row: rowIndex, message: "Email is required" });
				continue;
			}

			if (seenEmails.has(email)) {
				result.skipped += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: "Duplicate email in file",
				});
				continue;
			}

			if (!validateRole(row.role)) {
				result.failed += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: `Invalid role "${row.role}". Must be one of: ${[...PLATFORM_ROLES].join(", ")}`,
				});
				continue;
			}

			if (!validateStatus(row.status)) {
				result.failed += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: `Invalid status "${row.status}". Must be ACTIVE or INACTIVE`,
				});
				continue;
			}

			seenEmails.add(email);

			if (existingUserEmails.has(email)) {
				result.skipped += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: "User with this email already exists",
				});
				continue;
			}

			try {
				const name =
					`${(row.firstName ?? "").trim()} ${(row.lastName ?? "").trim()}`.trim() ||
					email;
				await prisma.user.create({
					data: {
						name,
						email,
						role: row.role as UserRole,
						status: row.status as UserStatus,
						title: row.title?.trim() || null,
						officePhone: row.officePhone?.trim() || null,
						phoneNumber: row.phoneNumber?.trim() || null,
					},
				});
				existingUserEmails.add(email);
				result.created += 1;
			} catch (err) {
				result.failed += 1;
				result.errors.push({
					row: rowIndex,
					email,
					message: err instanceof Error ? err.message : "Failed to create user",
				});
			}
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

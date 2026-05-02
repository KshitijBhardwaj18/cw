/**
 * Vendor job board demo: assigns the seed vendor to the demo requisition (RequisitionVendor),
 * ensures the requisition is PUBLISHED, and adds CandidateSavedRequisition rows for “Interested”.
 * Idempotent. Requires `seedOrgSubmissionsDemo` to have run (same org/requisition/vendor).
 */
import type { PrismaClient } from "@repo/db";
import { RequisitionStatus, UserRole, UserStatus } from "@repo/db";

/** Same as `seed-org-submissions-demo.ts` — your DB must contain this org + requisition. */
const SEED_TARGET_ORGANIZATION_ID = "a7769fe4-fd0a-4cba-83e3-061f3203ba84";
const SEED_TARGET_REQUISITION_ID = "42a4a9a9-e23a-4f53-a798-782b64c64141";

const SEED_VENDOR_INTERNAL_ID = "seed-vendor-submissions-demo";

/** Candidates who only “saved” the job (interested tab), no submission for this req. */
const INTERESTED_ONLY = [
	{
		email: "seed.jobsboard.interested.a@example.invalid",
		name: "Job Board Demo — Interested Only A",
	},
	{
		email: "seed.jobsboard.interested.b@example.invalid",
		name: "Job Board Demo — Interested Only B",
	},
] as const;

export async function seedVendorJobsBoard(prisma: PrismaClient): Promise<void> {
	const vendor = await prisma.vendor.findUnique({
		where: { internalId: SEED_VENDOR_INTERNAL_ID },
		select: { id: true, name: true },
	});
	if (!vendor) {
		console.log(
			"seedVendorJobsBoard: skipped — seed vendor not found (run submissions seed first)",
		);
		return;
	}

	const requisition = await prisma.requisition.findFirst({
		where: {
			id: SEED_TARGET_REQUISITION_ID,
			organizationId: SEED_TARGET_ORGANIZATION_ID,
		},
		select: {
			id: true,
			jobTitle: true,
			publishedAt: true,
			organizationOccupation: { select: { occupationId: true } },
		},
	});

	if (!requisition) {
		console.log(
			"seedVendorJobsBoard: skipped — demo requisition not found (org/req IDs from seed)",
		);
		return;
	}

	const occupationId = requisition.organizationOccupation?.occupationId;
	if (!occupationId) {
		console.log(
			"seedVendorJobsBoard: skipped — requisition has no organization occupation",
		);
		return;
	}

	await prisma.requisition.update({
		where: { id: requisition.id },
		data: {
			status: RequisitionStatus.PUBLISHED,
			publishedAt: requisition.publishedAt ?? new Date(),
			jobTitle: requisition.jobTitle ?? "PICU RN — Vendor Job Board (Seed)",
			jobSummary:
				"Seeded requisition for vendor portal job board. Pediatric ICU RN, nights, 13-week contract.",
		},
	});

	await prisma.requisitionVendor.upsert({
		where: {
			requisitionId_vendorId: {
				requisitionId: requisition.id,
				vendorId: vendor.id,
			},
		},
		create: {
			requisitionId: requisition.id,
			vendorId: vendor.id,
		},
		update: {},
	});

	console.log(
		`seedVendorJobsBoard: linked vendor ${vendor.name} to requisition ${requisition.id} (PUBLISHED)`,
	);

	for (const row of INTERESTED_ONLY) {
		const user = await prisma.user.upsert({
			where: { email: row.email },
			create: {
				email: row.email,
				name: row.name,
				role: UserRole.CANDIDATE_USER,
				emailVerified: true,
				phoneNumber: "+15555550100",
				status: UserStatus.ACTIVE,
			},
			update: {
				name: row.name,
				status: UserStatus.ACTIVE,
			},
		});

		const candidate = await prisma.candidate.upsert({
			where: { userId: user.id },
			create: {
				userId: user.id,
				organizationId: SEED_TARGET_ORGANIZATION_ID,
				vendorId: vendor.id,
				occupationId,
				city: "Boston",
				state: "MA",
				yearsOfExperience: 4,
				isAvailable: true,
				preferredShiftTypes: ["Night Shift"],
			},
			update: {
				organizationId: SEED_TARGET_ORGANIZATION_ID,
				vendorId: vendor.id,
				occupationId,
			},
		});

		await prisma.candidateSavedRequisition.upsert({
			where: {
				candidateId_requisitionId: {
					candidateId: candidate.id,
					requisitionId: requisition.id,
				},
			},
			create: {
				candidateId: candidate.id,
				requisitionId: requisition.id,
			},
			update: {},
		});
	}

	console.log(
		`seedVendorJobsBoard: ${INTERESTED_ONLY.length} interested-only saved requisitions`,
	);
}

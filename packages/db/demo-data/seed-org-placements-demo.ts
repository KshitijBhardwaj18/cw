import type { PrismaClient } from "@repo/db";
import {
	CandidateComplianceStatus,
	ComplianceListItemCategory,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	EmploymentType,
	OfferEventType,
	OrganizationIndustry,
	OrganizationVendorStatus,
	PlacementComplianceItemSource,
	PlacementComplianceStatus,
	PlacementStatus,
	PlacementTaskStatus,
	ShiftType,
	SubmissionStage,
	UserRole,
} from "@repo/db";
import { addDays, startOfDay } from "date-fns";

/** Preferred requisition id when it exists under the resolved org (local dev). */
const SEED_TARGET_REQUISITION_ID = "42a4a9a9-e23a-4f53-a798-782b64c64141";
const ACCEPTED_CANDIDATE_EMAIL = "seed.submissions.accepted@example.invalid";

const SEED_SUBMITTED_AT = new Date("2025-01-18T12:00:00.000Z");
const VENDOR_INTERNAL_ID = "seed-vendor-submissions-demo";

const requisitionInclude = {
	organizationOccupation: { select: { occupationId: true } },
} as const;

/**
 * Resolves org + vendor + requisition for placement demos: prefers the canonical seed
 * org/requisition when they exist; otherwise uses any ACTIVE organizationVendor and the
 * first requisition in that org so seeds work across environments.
 */
async function resolvePlacementDemoTargets(prisma: PrismaClient): Promise<{
	orgId: string;
	vendorId: string;
	requisition: {
		id: string;
		organizationId: string;
		jobTitle: string | null;
		jobSummary: string | null;
		unitName: string | null;
		locationId: string | null;
		departmentId: string | null;
		hiringManagerId: string | null;
		organizationOccupation: { occupationId: string } | null;
	};
} | null> {
	const vendor =
		(await prisma.vendor.findUnique({
			where: { internalId: VENDOR_INTERNAL_ID },
			select: { id: true },
		})) ??
		(await prisma.vendor.findFirst({
			where: {
				organizationVendors: {
					some: { status: OrganizationVendorStatus.ACTIVE },
				},
			},
			select: { id: true },
		}));

	if (!vendor) {
		return null;
	}

	const orgVendor = await prisma.organizationVendor.findFirst({
		where: { vendorId: vendor.id, status: OrganizationVendorStatus.ACTIVE },
		select: { organizationId: true },
		orderBy: { createdAt: "asc" },
	});
	if (!orgVendor) {
		return null;
	}

	const orgId = orgVendor.organizationId;

	let requisition = await prisma.requisition.findFirst({
		where: {
			id: SEED_TARGET_REQUISITION_ID,
			organizationId: orgId,
		},
		include: requisitionInclude,
	});

	if (!requisition) {
		requisition = await prisma.requisition.findFirst({
			where: { organizationId: orgId },
			include: requisitionInclude,
			orderBy: { createdAt: "asc" },
		});
	}

	if (!requisition) {
		return null;
	}

	return {
		orgId,
		vendorId: vendor.id,
		requisition,
	};
}

async function resolveRequisitionForOrg(
	prisma: PrismaClient,
	orgId: string,
): Promise<{
	id: string;
	organizationId: string;
	jobTitle: string | null;
	jobSummary: string | null;
	unitName: string | null;
	locationId: string | null;
	departmentId: string | null;
	hiringManagerId: string | null;
	organizationOccupation: { occupationId: string } | null;
} | null> {
	let requisition = await prisma.requisition.findFirst({
		where: {
			id: SEED_TARGET_REQUISITION_ID,
			organizationId: orgId,
		},
		include: requisitionInclude,
	});

	if (!requisition) {
		requisition = await prisma.requisition.findFirst({
			where: { organizationId: orgId },
			include: requisitionInclude,
			orderBy: { createdAt: "asc" },
		});
	}

	return requisition;
}

async function resolveSeedVendorId(
	prisma: PrismaClient,
): Promise<string | null> {
	const vendor =
		(await prisma.vendor.findUnique({
			where: { internalId: VENDOR_INTERNAL_ID },
			select: { id: true },
		})) ??
		(await prisma.vendor.findFirst({
			where: {
				organizationVendors: {
					some: { status: OrganizationVendorStatus.ACTIVE },
				},
			},
			select: { id: true },
		}));
	return vendor?.id ?? null;
}

type TabDemoRow = {
	email: string;
	displayName: string;
	placementNumber: string;
	status: PlacementStatus;
	workforceGroup: string;
	jobTitle: string;
	startDate: Date;
	endDate: Date;
	billRate: number;
	payRate: number;
};

const TAB_DEMO_PLACEMENTS: TabDemoRow[] = [
	{
		email: "seed.placement.tab.upcoming1@example.invalid",
		displayName: "Tab Demo — Upcoming (ICU)",
		placementNumber: "PL-DEMO-2026-U1",
		status: PlacementStatus.UPCOMING,
		workforceGroup: "AGENCY_VENDOR",
		jobTitle: "RN — ICU (Upcoming)",
		startDate: new Date("2026-09-01T12:00:00.000Z"),
		endDate: new Date("2027-03-01T12:00:00.000Z"),
		billRate: 82,
		payRate: 68,
	},
	{
		email: "seed.placement.tab.upcoming2@example.invalid",
		displayName: "Tab Demo — Pending (ER)",
		placementNumber: "PL-DEMO-2026-U2",
		status: PlacementStatus.PENDING,
		workforceGroup: "PER_DIEM",
		jobTitle: "RN — ER (Pending start)",
		startDate: new Date("2026-07-15T12:00:00.000Z"),
		endDate: new Date("2026-12-15T12:00:00.000Z"),
		billRate: 79,
		payRate: 65,
	},
	{
		email: "seed.placement.tab.upcoming3@example.invalid",
		displayName: "Tab Demo — On hold",
		placementNumber: "PL-DEMO-2026-U3",
		status: PlacementStatus.ON_HOLD,
		workforceGroup: "TRAVEL_NURSES",
		jobTitle: "Travel RN — OR (On hold)",
		startDate: new Date("2026-08-01T12:00:00.000Z"),
		endDate: new Date("2027-02-01T12:00:00.000Z"),
		billRate: 91,
		payRate: 74,
	},
	{
		email: "seed.placement.tab.active1@example.invalid",
		displayName: "Tab Demo — Active (Med-Surg)",
		placementNumber: "PL-DEMO-2026-A1",
		status: PlacementStatus.ACTIVE,
		workforceGroup: "AGENCY_VENDOR",
		jobTitle: "LPN — Med-Surg",
		startDate: new Date("2026-01-10T12:00:00.000Z"),
		endDate: new Date("2026-10-10T12:00:00.000Z"),
		billRate: 71,
		payRate: 58,
	},
	{
		email: "seed.placement.tab.active2@example.invalid",
		displayName: "Tab Demo — Ending soon",
		placementNumber: "PL-DEMO-2026-A2",
		status: PlacementStatus.ENDING_SOON,
		workforceGroup: "TRAVEL_NURSES",
		jobTitle: "Travel RN — Telemetry",
		startDate: new Date("2025-11-01T12:00:00.000Z"),
		endDate: new Date("2026-04-25T12:00:00.000Z"),
		billRate: 88,
		payRate: 72,
	},
	{
		email: "seed.placement.tab.completed1@example.invalid",
		displayName: "Tab Demo — Completed",
		placementNumber: "PL-DEMO-2026-C1",
		status: PlacementStatus.COMPLETED,
		workforceGroup: "INTERNAL_STAFF",
		jobTitle: "PT — Outpatient",
		startDate: new Date("2025-03-01T12:00:00.000Z"),
		endDate: new Date("2025-12-15T12:00:00.000Z"),
		billRate: 65,
		payRate: 54,
	},
	{
		email: "seed.placement.tab.completed2@example.invalid",
		displayName: "Tab Demo — Terminated",
		placementNumber: "PL-DEMO-2026-C2",
		status: PlacementStatus.TERMINATED,
		workforceGroup: "AGENCY_VENDOR",
		jobTitle: "RN — Float Pool",
		startDate: new Date("2025-06-01T12:00:00.000Z"),
		endDate: new Date("2026-01-15T12:00:00.000Z"),
		billRate: 77,
		payRate: 63,
	},
	{
		email: "seed.placement.tab.completed3@example.invalid",
		displayName: "Tab Demo — Inactive",
		placementNumber: "PL-DEMO-2026-C3",
		status: PlacementStatus.INACTIVE,
		workforceGroup: "PER_DIEM",
		jobTitle: "CNA — Nights",
		startDate: new Date("2025-04-01T12:00:00.000Z"),
		endDate: new Date("2025-11-30T12:00:00.000Z"),
		billRate: 42,
		payRate: 35,
	},
];

async function resolveOccupationId(
	prisma: PrismaClient,
	requisition: {
		organizationOccupation: { occupationId: string } | null;
	},
): Promise<string | null> {
	const occupationId = requisition.organizationOccupation?.occupationId ?? null;
	if (occupationId) return occupationId;

	const occ = await prisma.occupation.findFirst({
		where: { code: "SEED_RN" },
	});
	if (occ) return occ.id;

	const created = await prisma.occupation.create({
		data: {
			name: "Registered Nurse (Seed)",
			code: "SEED_RN",
			acronym: "RN",
			industry: OrganizationIndustry.HEALTHCARE,
		},
	});
	return created.id;
}

async function ensureAcceptedSubmissionForTabDemo(
	prisma: PrismaClient,
	params: {
		orgId: string;
		requisitionId: string;
		occupationId: string;
		vendorId: string;
		email: string;
		displayName: string;
	},
) {
	const user = await prisma.user.upsert({
		where: { email: params.email },
		create: {
			email: params.email,
			name: params.displayName,
			role: UserRole.CANDIDATE_USER,
			emailVerified: true,
			phoneNumber: "(555) 123-4567",
		},
		update: {
			name: params.displayName,
			phoneNumber: "(555) 123-4567",
		},
	});

	const candidate = await prisma.candidate.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			occupationId: params.occupationId,
			organizationId: params.orgId,
			vendorId: params.vendorId,
			streetAddress: "123 Main St",
			city: "Boston",
			state: "MA",
			zipCode: "02108",
			yearsOfExperience: 3,
			preferredShiftTypes: ["Day Shift"],
			availableFrom: new Date("2025-02-01T12:00:00.000Z"),
		},
		update: {
			organizationId: params.orgId,
			vendorId: params.vendorId,
			occupationId: params.occupationId,
		},
	});

	const existing = await prisma.submission.findFirst({
		where: {
			candidateId: candidate.id,
			requisitionId: params.requisitionId,
		},
	});

	const acceptedAt = new Date("2025-11-01T12:00:00.000Z");

	if (existing) {
		await prisma.submission.update({
			where: { id: existing.id },
			data: {
				organizationId: params.orgId,
				stage: SubmissionStage.ACCEPTED,
				stageEnteredAt: acceptedAt,
				vendorId: params.vendorId,
				submittedAt: SEED_SUBMITTED_AT,
				billingRate: 95,
				acceptedAt,
			},
		});
		return { submissionId: existing.id, candidateUserId: user.id };
	}

	const created = await prisma.submission.create({
		data: {
			organizationId: params.orgId,
			requisitionId: params.requisitionId,
			candidateId: candidate.id,
			vendorId: params.vendorId,
			stage: SubmissionStage.ACCEPTED,
			stageEnteredAt: acceptedAt,
			submittedAt: SEED_SUBMITTED_AT,
			billingRate: 95,
			acceptedAt,
		},
	});
	return { submissionId: created.id, candidateUserId: user.id };
}

async function syncPlacementComplianceAndStatus(
	prisma: PrismaClient,
	placementId: string,
	candidateId: string,
	requisitionId: string,
) {
	const criteria = await prisma.requisitionAcceptanceCriterion.findMany({
		where: { requisitionId },
		select: { complianceListItemId: true },
	});
	if (criteria.length > 0) {
		await prisma.placementComplianceItem.createMany({
			data: criteria.map((c) => ({
				placementId,
				complianceListItemId: c.complianceListItemId,
				source: PlacementComplianceItemSource.REQUISITION,
				isRequired: true,
			})),
			skipDuplicates: true,
		});
	}

	const now = new Date();
	const required = await prisma.placementComplianceItem.findMany({
		where: { placementId, removedAt: null },
		select: { complianceListItemId: true },
	});

	let status: PlacementComplianceStatus;
	let completed = 0;
	if (required.length === 0) {
		status = PlacementComplianceStatus.COMPLETE;
	} else {
		const approvedCount = await prisma.candidateCompliance.count({
			where: {
				candidateId,
				complianceListItemId: {
					in: required.map((r) => r.complianceListItemId),
				},
				status: "APPROVED",
				OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
			},
		});
		completed = approvedCount;
		status =
			approvedCount >= required.length
				? PlacementComplianceStatus.COMPLETE
				: approvedCount > 0
					? PlacementComplianceStatus.IN_PROGRESS
					: PlacementComplianceStatus.MISSING;
	}

	const missingNames = await prisma.$queryRaw<{ name: string }[]>`
		SELECT cli.name AS name
		FROM placement_compliance_items pci
		INNER JOIN compliance_list_item cli ON cli.id = pci."complianceListItemId"
		LEFT JOIN candidate_compliance cc
			ON cc."candidateId" = ${candidateId}::uuid
			AND cc."complianceListItemId" = pci."complianceListItemId"
		WHERE pci."placementId" = ${placementId}::uuid
			AND pci."removedAt" IS NULL
			AND (
				cc.id IS NULL
				OR NOT (
					cc.status = 'APPROVED'::"CandidateComplianceStatus"
					AND (cc."expiryDate" IS NULL OR cc."expiryDate" > ${now})
				)
			)
		ORDER BY cli.name ASC
		LIMIT 2
	`;
	const missingTotal = Math.max(0, required.length - completed);
	let preview: string | null = null;
	if (missingTotal > 0 && missingNames.length > 0) {
		const shown = missingNames.map((m) => m.name).slice(0, 2);
		const rest = missingTotal - shown.length;
		preview = rest > 0 ? `${shown.join(", ")} +${rest} more` : shown.join(", ");
	}

	const placement = await prisma.placement.findUniqueOrThrow({
		where: { id: placementId },
		select: {
			organizationId: true,
			vendorId: true,
			requisitionId: true,
			status: true,
		},
	});

	await prisma.placement.update({
		where: { id: placementId },
		data: {
			summary: {
				upsert: {
					update: {
						organizationId: placement.organizationId,
						vendorId: placement.vendorId,
						candidateId,
						requisitionId: placement.requisitionId,
						status: placement.status,
						complianceStatus: status,
						complianceProgressCompleted: completed,
						complianceProgressTotal: required.length,
						complianceMissingItemsPreview: preview,
						lastComplianceUpdatedAt: now,
					},
					create: {
						organizationId: placement.organizationId,
						vendorId: placement.vendorId,
						candidateId,
						requisitionId: placement.requisitionId,
						status: placement.status,
						complianceStatus: status,
						complianceProgressCompleted: completed,
						complianceProgressTotal: required.length,
						complianceMissingItemsPreview: preview,
						lastComplianceUpdatedAt: now,
					},
				},
			},
		},
	});
}

async function upsertTabDemoPlacement(
	prisma: PrismaClient,
	params: {
		orgId: string;
		requisition: {
			id: string;
			jobTitle: string | null;
			jobSummary: string | null;
			unitName: string | null;
			locationId: string | null;
			departmentId: string | null;
			hiringManagerId: string | null;
		};
		row: TabDemoRow;
		occupationId: string;
		vendorId: string;
		adminId: string | null;
	},
) {
	const { submissionId, candidateUserId } =
		await ensureAcceptedSubmissionForTabDemo(prisma, {
			orgId: params.orgId,
			requisitionId: params.requisition.id,
			occupationId: params.occupationId,
			vendorId: params.vendorId,
			email: params.row.email,
			displayName: params.row.displayName,
		});

	const submission = await prisma.submission.findUniqueOrThrow({
		where: { id: submissionId },
		select: { candidateId: true, requisitionId: true },
	});

	const acceptedAt = new Date("2025-11-01T12:00:00.000Z");
	const req = params.requisition;

	const existingPlacement = await prisma.placement.findFirst({
		where: { submissionId },
	});

	const baseData = {
		organizationId: params.orgId,
		submissionId,
		candidateId: submission.candidateId,
		requisitionId: submission.requisitionId,
		placementNumber: params.row.placementNumber,
		status: params.row.status,
		jobTitle: params.row.jobTitle,
		unitName: req.unitName,
		workforceGroup: params.row.workforceGroup,
		startDate: params.row.startDate,
		endDate: params.row.endDate,
		billRate: params.row.billRate,
		payRate: params.row.payRate,
		overtimeEligible: true,
		employmentType: EmploymentType.CONTRACT,
		acceptedById: candidateUserId,
		acceptedAt,
		shiftType: ShiftType.NIGHTS,
		shiftSchedule: ["Monday", "Wednesday", "Friday"],
		hoursPerWeek: 36,
		locationId: req.locationId,
		departmentId: req.departmentId,
		hiringManagerId: req.hiringManagerId,
		createdBy: params.adminId,
	};

	const placementRow = existingPlacement
		? await prisma.placement.update({
				where: { id: existingPlacement.id },
				data: baseData,
			})
		: await prisma.placement.create({ data: baseData });

	await syncPlacementComplianceAndStatus(
		prisma,
		placementRow.id,
		submission.candidateId,
		submission.requisitionId,
	);

	const histCount = await prisma.placementOfferHistory.count({
		where: { placementId: placementRow.id },
	});
	if (histCount === 0) {
		const hm = req.hiringManagerId;
		await prisma.placementOfferHistory.createMany({
			data: [
				{
					placementId: placementRow.id,
					eventType: OfferEventType.PLACEMENT_CREATED,
					description:
						"Placement record created from accepted offer; compliance template attached.",
					performedAt: new Date("2025-10-20T14:00:00.000Z"),
				},
				{
					placementId: placementRow.id,
					eventType: OfferEventType.OFFER_EXTENDED,
					description: "Baseline offer extended for this assignment.",
					billRateSnapshot: params.row.billRate,
					payRateSnapshot: params.row.payRate,
					startDateSnapshot: params.row.startDate,
					employmentType: EmploymentType.CONTRACT,
					performedById: hm,
					performedAt: new Date("2025-10-21T10:00:00.000Z"),
				},
				{
					placementId: placementRow.id,
					eventType: OfferEventType.OFFER_MODIFIED,
					description: "Rates revised after vendor fee update.",
					billRateSnapshot: params.row.billRate + 2,
					payRateSnapshot: params.row.payRate + 1,
					performedAt: new Date("2025-10-22T16:30:00.000Z"),
				},
				{
					placementId: placementRow.id,
					eventType: OfferEventType.START_DATE_ADJUSTED,
					description: "Start date aligned with credentialing timeline.",
					startDateSnapshot: params.row.startDate,
					performedAt: new Date("2025-11-01T12:00:00.000Z"),
				},
			],
		});
	}
}

export async function seedOrgPlacementsDemo(
	prisma: PrismaClient,
	options: { seedAdminEmail: string },
): Promise<void> {
	const targets = await resolvePlacementDemoTargets(prisma);
	if (!targets) {
		console.log(
			"seedOrgPlacementsDemo: skipped — could not resolve org + vendor + requisition (ensure organizationVendor ACTIVE and at least one requisition)",
		);
		return;
	}

	const { orgId, vendorId, requisition } = targets;

	const occupationId = await resolveOccupationId(prisma, requisition);
	if (!occupationId) {
		console.log(
			"seedOrgPlacementsDemo: skipped — could not resolve occupation",
		);
		return;
	}

	const admin = await prisma.user.findUnique({
		where: { email: options.seedAdminEmail },
		select: { id: true },
	});

	const reqPick = {
		id: requisition.id,
		jobTitle: requisition.jobTitle,
		jobSummary: requisition.jobSummary,
		unitName: requisition.unitName,
		locationId: requisition.locationId,
		departmentId: requisition.departmentId,
		hiringManagerId: requisition.hiringManagerId,
	};

	for (const row of TAB_DEMO_PLACEMENTS) {
		await upsertTabDemoPlacement(prisma, {
			orgId,
			requisition: reqPick,
			row,
			occupationId,
			vendorId,
			adminId: admin?.id ?? null,
		});
	}

	const submission = await prisma.submission.findFirst({
		where: {
			organizationId: orgId,
			requisitionId: requisition.id,
			stage: SubmissionStage.ACCEPTED,
			candidate: {
				user: { email: ACCEPTED_CANDIDATE_EMAIL },
			},
		},
		include: {
			candidate: { include: { user: true } },
			requisition: true,
		},
	});

	if (!submission) {
		console.log(
			"seedOrgPlacementsDemo: primary rich placement skipped — accepted seed submission not found",
		);
		console.log(
			`seedOrgPlacementsDemo: tab demos upserted (${TAB_DEMO_PLACEMENTS.length} rows)`,
		);
		return;
	}

	const start = new Date("2026-02-01T12:00:00.000Z");
	const end = new Date("2026-08-01T12:00:00.000Z");
	const acceptedAt = new Date("2025-12-07T14:45:00.000Z");

	const req = submission.requisition;

	let placementId: string;
	const existing = await prisma.placement.findFirst({
		where: { submissionId: submission.id },
	});

	if (existing) {
		placementId = existing.id;
		await prisma.placement.update({
			where: { id: existing.id },
			data: {
				status: PlacementStatus.ACTIVE,
				jobTitle: req?.jobTitle ?? req?.jobSummary ?? "RN — ICU (Seed)",
				unitName: req?.unitName,
				workforceGroup: "AGENCY_VENDOR",
				startDate: start,
				endDate: end,
				billRate: 75,
				payRate: 62,
				overtimeEligible: true,
				employmentType: EmploymentType.CONTRACT,
				acceptedById: submission.candidate.userId,
				acceptedAt,
				shiftType: ShiftType.NIGHTS,
				shiftSchedule: ["Monday", "Tuesday", "Friday", "Saturday"],
				hoursPerWeek: 36,
				locationId: req?.locationId ?? null,
				departmentId: req?.departmentId ?? null,
				hiringManagerId: req?.hiringManagerId ?? null,
			},
		});
	} else {
		const created = await prisma.placement.create({
			data: {
				organizationId: orgId,
				submissionId: submission.id,
				candidateId: submission.candidateId,
				requisitionId: submission.requisitionId,
				placementNumber: `PL-SEED-${new Date().getFullYear()}-001`,
				status: PlacementStatus.ACTIVE,
				jobTitle: req?.jobTitle ?? req?.jobSummary ?? "RN — ICU (Seed)",
				unitName: req?.unitName,
				workforceGroup: "AGENCY_VENDOR",
				startDate: start,
				endDate: end,
				billRate: 75,
				payRate: 62,
				overtimeEligible: true,
				employmentType: EmploymentType.CONTRACT,
				acceptedById: submission.candidate.userId,
				acceptedAt,
				shiftType: ShiftType.NIGHTS,
				shiftSchedule: ["Monday", "Tuesday", "Friday", "Saturday"],
				hoursPerWeek: 36,
				locationId: req?.locationId ?? null,
				departmentId: req?.departmentId ?? null,
				hiringManagerId: req?.hiringManagerId ?? null,
				createdBy: admin?.id ?? null,
			},
		});
		placementId = created.id;
	}

	await syncPlacementComplianceAndStatus(
		prisma,
		placementId,
		submission.candidateId,
		submission.requisitionId,
	);

	const historyCount = await prisma.placementOfferHistory.count({
		where: { placementId },
	});

	if (historyCount === 0) {
		const hmId = req?.hiringManagerId ?? null;
		const candUserId = submission.candidate.userId;

		await prisma.placementOfferHistory.createMany({
			data: [
				{
					placementId,
					eventType: OfferEventType.OFFER_EXTENDED,
					description: "Initial offer sent to candidate via email",
					billRateSnapshot: 78,
					payRateSnapshot: 64,
					startDateSnapshot: start,
					employmentType: EmploymentType.CONTRACT,
					performedById: hmId,
					performedAt: new Date("2025-11-28T15:30:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_VIEWED,
					description: "Candidate viewed offer details in the portal.",
					performedById: candUserId,
					performedAt: new Date("2025-11-29T11:00:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_MODIFIED,
					description:
						"Offer updated: weekend differential and pay band alignment.",
					billRateSnapshot: 75,
					payRateSnapshot: 62,
					startDateSnapshot: start,
					performedById: hmId,
					performedAt: new Date("2025-11-30T09:15:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_DECLINED,
					description:
						"Candidate declined first schedule variant (extra weekend shifts).",
					performedById: candUserId,
					performedAt: new Date("2025-12-01T13:45:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_EXPIRED,
					description:
						"Prior contingent offer expired without signature; new terms issued.",
					performedAt: new Date("2025-12-02T17:00:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_EXTENDED,
					description: "Revised offer issued with updated schedule and rates.",
					billRateSnapshot: 75,
					payRateSnapshot: 62,
					startDateSnapshot: start,
					employmentType: EmploymentType.CONTRACT,
					performedById: hmId,
					performedAt: new Date("2025-12-03T10:00:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_VIEWED,
					description: "Candidate reviewed revised offer.",
					performedById: candUserId,
					performedAt: new Date("2025-12-04T14:20:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_ACCEPTED,
					description: "Candidate accepted offer and signed agreement.",
					billRateSnapshot: 75,
					payRateSnapshot: 62,
					startDateSnapshot: start,
					performedById: candUserId,
					performedAt: acceptedAt,
				},
				{
					placementId,
					eventType: OfferEventType.PLACEMENT_CREATED,
					description:
						"Placement created and compliance checklist generated from requisition template.",
					performedAt: new Date("2025-12-08T16:00:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.OFFER_MODIFIED,
					description:
						"Post-offer adjustment: bill rate updated for holiday differential.",
					billRateSnapshot: 76,
					payRateSnapshot: 62,
					performedById: hmId,
					performedAt: new Date("2025-12-18T11:30:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.START_DATE_ADJUSTED,
					description: "Start date adjusted to align with onboarding schedule.",
					startDateSnapshot: start,
					performedById: hmId,
					performedAt: new Date("2026-01-10T20:00:00.000Z"),
				},
				{
					placementId,
					eventType: OfferEventType.ASSIGNMENT_STARTED,
					description: "Candidate began first shift.",
					performedAt: new Date("2026-02-01T00:00:00.000Z"),
				},
			],
		});
	}

	const notesCount = await prisma.placementNote.count({
		where: { placementId },
	});
	if (notesCount === 0 && admin) {
		await prisma.placementNote.createMany({
			data: [
				{
					placementId,
					content:
						"Candidate has integrated well with the team. Staff feedback has been positive.",
					createdById: admin.id,
					createdByRole: "Hiring Manager",
					createdAt: new Date("2026-01-22T15:00:00.000Z"),
				},
				{
					placementId,
					content:
						"Extended orientation completed. Shift handover protocols reviewed.",
					createdById: admin.id,
					createdByRole: "HR Manager",
					createdAt: new Date("2026-01-18T11:30:00.000Z"),
				},
			],
		});
	}

	const tasksCount = await prisma.placementTask.count({
		where: { placementId },
	});
	if (tasksCount === 0 && admin) {
		await prisma.placementTask.createMany({
			data: [
				{
					placementId,
					title: "Schedule mid-assignment performance review",
					description:
						"Coordinate with hiring manager and candidate for review meeting",
					dueDate: new Date("2026-03-15T12:00:00.000Z"),
					status: PlacementTaskStatus.PENDING,
					assignedToId: admin.id,
					createdById: admin.id,
				},
				{
					placementId,
					title: "Verify updated BLS certification",
					description:
						"Confirm renewed BLS card is on file before Feb deadline.",
					dueDate: new Date("2026-02-01T12:00:00.000Z"),
					status: PlacementTaskStatus.PENDING,
					assignedToId: admin.id,
					createdById: admin.id,
				},
			],
		});
	}

	await seedCredentialsTabData(prisma, {
		requisitionId: requisition.id,
		primaryPlacementId: placementId,
		primaryCandidateId: submission.candidate.id,
	});

	console.log(
		`seedOrgPlacementsDemo: org=${orgId} req=${requisition.id} vendor=${vendorId} primaryPlacementId=${placementId}; tabDemos=${TAB_DEMO_PLACEMENTS.length} (idempotent)`,
	);
	console.log(
		`seedOrgPlacementsDemo: candidate portal — use ${ACCEPTED_CANDIDATE_EMAIL} (placements require accepted submission + this seed)`,
	);
}

export async function seedVendorOnboardingWindowDemo(
	prisma: PrismaClient,
	options: { seedAdminEmail: string },
): Promise<void> {
	const fromPortalUsers = await prisma.vendorUser.findMany({
		distinct: ["vendorId"],
		select: { vendorId: true },
	});
	const vendorIds = [...new Set(fromPortalUsers.map((r) => r.vendorId))];
	const fallbackVendorId = await resolveSeedVendorId(prisma);
	if (fallbackVendorId && !vendorIds.includes(fallbackVendorId)) {
		vendorIds.push(fallbackVendorId);
	}

	if (vendorIds.length === 0) {
		console.log(
			"seedVendorOnboardingWindowDemo: skipped — no vendor portal users and no fallback vendor",
		);
		return;
	}

	const admin = await prisma.user.findUnique({
		where: { email: options.seedAdminEmail },
		select: { id: true },
	});

	const today = startOfDay(new Date());
	let orgsSeeded = 0;
	let placementsUpserted = 0;

	for (const vendorId of vendorIds) {
		const orgLinks = await prisma.organizationVendor.findMany({
			where: { vendorId, status: OrganizationVendorStatus.ACTIVE },
			select: { organizationId: true },
			orderBy: { createdAt: "asc" },
		});

		if (orgLinks.length === 0) {
			console.log(
				`seedVendorOnboardingWindowDemo: skipped vendor=${vendorId} — no ACTIVE organizationVendor rows`,
			);
			continue;
		}

		for (const { organizationId: orgId } of orgLinks) {
			const requisition = await resolveRequisitionForOrg(prisma, orgId);
			if (!requisition) {
				console.log(
					`seedVendorOnboardingWindowDemo: skipped org=${orgId} — no requisition`,
				);
				continue;
			}

			const occupationId = await resolveOccupationId(prisma, requisition);
			if (!occupationId) {
				console.log(
					`seedVendorOnboardingWindowDemo: skipped org=${orgId} — no occupation`,
				);
				continue;
			}

			const orgTag = `${vendorId.replace(/-/g, "").slice(0, 8)}-${orgId.replace(/-/g, "").slice(0, 8)}`;
			const reqPick = {
				id: requisition.id,
				jobTitle: requisition.jobTitle,
				jobSummary: requisition.jobSummary,
				unitName: requisition.unitName,
				locationId: requisition.locationId,
				departmentId: requisition.departmentId,
				hiringManagerId: requisition.hiringManagerId,
			};

			const rows: TabDemoRow[] = [
				{
					email: `seed.onboarding.w1.${orgTag}@example.invalid`,
					displayName: "Onboarding — Week bucket 1",
					placementNumber: `PL-ONB-${orgTag}-W1`,
					status: PlacementStatus.UPCOMING,
					workforceGroup: "AGENCY_VENDOR",
					jobTitle: "RN — Onboarding window (week 1)",
					startDate: addDays(today, 4),
					endDate: addDays(today, 190),
					billRate: 80,
					payRate: 66,
				},
				{
					email: `seed.onboarding.w2.${orgTag}@example.invalid`,
					displayName: "Onboarding — Week bucket 2",
					placementNumber: `PL-ONB-${orgTag}-W2`,
					status: PlacementStatus.PENDING,
					workforceGroup: "PER_DIEM",
					jobTitle: "LPN — Onboarding window (week 2)",
					startDate: addDays(today, 11),
					endDate: addDays(today, 200),
					billRate: 78,
					payRate: 64,
				},
				{
					email: `seed.onboarding.w3.${orgTag}@example.invalid`,
					displayName: "Onboarding — Week bucket 3",
					placementNumber: `PL-ONB-${orgTag}-W3`,
					status: PlacementStatus.ON_HOLD,
					workforceGroup: "TRAVEL_NURSES",
					jobTitle: "Travel RN — Onboarding window (week 3)",
					startDate: addDays(today, 19),
					endDate: addDays(today, 210),
					billRate: 92,
					payRate: 75,
				},
			];

			for (const row of rows) {
				await upsertTabDemoPlacement(prisma, {
					orgId,
					requisition: reqPick,
					row,
					occupationId,
					vendorId,
					adminId: admin?.id ?? null,
				});
			}

			orgsSeeded += 1;
			placementsUpserted += rows.length;
		}
	}

	console.log(
		`seedVendorOnboardingWindowDemo: upserted ${placementsUpserted} placements across ${orgsSeeded} vendor–org pair(s) (rolling 21-day window)`,
	);
}

async function ensureComplianceListItem(
	prisma: PrismaClient,
	name: string,
	category: ComplianceListItemCategory,
): Promise<string> {
	const existing = await prisma.complianceListItem.findFirst({
		where: { name },
		select: { id: true },
	});
	if (existing) return existing.id;
	const created = await prisma.complianceListItem.create({
		data: {
			name,
			category,
			expirationType: ComplianceListItemExpirationType.EXPIRATION_DATE,
			responseStyle: ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD,
			displayToCandidate: true,
		},
		select: { id: true },
	});
	return created.id;
}

async function upsertCandidateCompliance(
	prisma: PrismaClient,
	params: {
		candidateId: string;
		complianceListItemId: string;
		status: CandidateComplianceStatus;
		expiryDate?: Date;
		documentFileName?: string;
	},
) {
	const existing = await prisma.candidateCompliance.findFirst({
		where: {
			candidateId: params.candidateId,
			complianceListItemId: params.complianceListItemId,
		},
		select: { id: true },
	});
	if (existing) {
		await prisma.candidateCompliance.update({
			where: { id: existing.id },
			data: {
				status: params.status,
				expiryDate: params.expiryDate ?? null,
				documentFileName: params.documentFileName ?? null,
			},
		});
	} else {
		await prisma.candidateCompliance.create({
			data: {
				candidateId: params.candidateId,
				complianceListItemId: params.complianceListItemId,
				status: params.status,
				expiryDate: params.expiryDate ?? null,
				documentFileName: params.documentFileName ?? null,
				uploadedAt: params.documentFileName ? new Date() : null,
			},
		});
	}
}

async function seedCredentialsTabData(
	prisma: PrismaClient,
	params: {
		requisitionId: string;
		primaryPlacementId: string;
		primaryCandidateId: string;
	},
) {
	const now = new Date();
	const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

	const blsId = await ensureComplianceListItem(
		prisma,
		"BLS Certification",
		ComplianceListItemCategory.CERTIFICATIONS,
	);
	const rnLicenseId = await ensureComplianceListItem(
		prisma,
		"RN License",
		ComplianceListItemCategory.LICENSES,
	);
	const aclsId = await ensureComplianceListItem(
		prisma,
		"ACLS Certification",
		ComplianceListItemCategory.CERTIFICATIONS,
	);
	const physicalExamId = await ensureComplianceListItem(
		prisma,
		"Physical Exam",
		ComplianceListItemCategory.EMPLOYEE_HEALTH,
	);
	const tbTestId = await ensureComplianceListItem(
		prisma,
		"TB Test",
		ComplianceListItemCategory.EMPLOYEE_HEALTH,
	);

	const criteriaItems = [blsId, rnLicenseId, aclsId, physicalExamId];
	for (const complianceListItemId of criteriaItems) {
		const existing = await prisma.requisitionAcceptanceCriterion.findFirst({
			where: {
				requisitionId: params.requisitionId,
				complianceListItemId,
			},
			select: { id: true },
		});
		if (!existing) {
			await prisma.requisitionAcceptanceCriterion.create({
				data: { requisitionId: params.requisitionId, complianceListItemId },
			});
		}
	}

	await upsertCandidateCompliance(prisma, {
		candidateId: params.primaryCandidateId,
		complianceListItemId: blsId,
		status: CandidateComplianceStatus.APPROVED,
		expiryDate: days(5),
		documentFileName: "BLS_Cert_2025.pdf",
	});
	await upsertCandidateCompliance(prisma, {
		candidateId: params.primaryCandidateId,
		complianceListItemId: aclsId,
		status: CandidateComplianceStatus.APPROVED,
		expiryDate: days(18),
		documentFileName: "ACLS_Cert_2025.pdf",
	});

	const active1 = await prisma.candidate.findFirst({
		where: {
			user: { email: "seed.placement.tab.active1@example.invalid" },
		},
		select: { id: true },
	});
	if (active1) {
		await upsertCandidateCompliance(prisma, {
			candidateId: active1.id,
			complianceListItemId: physicalExamId,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: days(12),
			documentFileName: "Physical_Exam_2025.pdf",
		});
		await upsertCandidateCompliance(prisma, {
			candidateId: active1.id,
			complianceListItemId: tbTestId,
			status: CandidateComplianceStatus.EXPIRED,
			expiryDate: days(-8),
		});
	}

	const active2 = await prisma.candidate.findFirst({
		where: {
			user: { email: "seed.placement.tab.active2@example.invalid" },
		},
		select: { id: true },
	});
	if (active2) {
		await upsertCandidateCompliance(prisma, {
			candidateId: active2.id,
			complianceListItemId: rnLicenseId,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: days(3),
			documentFileName: "RN_License_MA_2025.pdf",
		});
	}

	const upcoming1 = await prisma.candidate.findFirst({
		where: {
			user: { email: "seed.placement.tab.upcoming1@example.invalid" },
		},
		select: { id: true },
	});
	if (upcoming1) {
		await upsertCandidateCompliance(prisma, {
			candidateId: upcoming1.id,
			complianceListItemId: blsId,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: days(180),
			documentFileName: "BLS_Cert_2025.pdf",
		});
		await upsertCandidateCompliance(prisma, {
			candidateId: upcoming1.id,
			complianceListItemId: rnLicenseId,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: days(365),
			documentFileName: "RN_License_MA_2025.pdf",
		});
	}

	const upcoming3 = await prisma.candidate.findFirst({
		where: {
			user: { email: "seed.placement.tab.upcoming3@example.invalid" },
		},
		select: { id: true },
	});
	if (upcoming3) {
		const approvedItems = [
			{ id: blsId, file: "BLS_Cert.pdf", exp: days(200) },
			{ id: rnLicenseId, file: "RN_License.pdf", exp: days(400) },
			{ id: aclsId, file: "ACLS_Cert.pdf", exp: days(180) },
			{ id: physicalExamId, file: "Physical_Exam.pdf", exp: days(300) },
		];
		for (const item of approvedItems) {
			await upsertCandidateCompliance(prisma, {
				candidateId: upcoming3.id,
				complianceListItemId: item.id,
				status: CandidateComplianceStatus.APPROVED,
				expiryDate: item.exp,
				documentFileName: item.file,
			});
		}
	}
}

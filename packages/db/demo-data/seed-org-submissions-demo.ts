/**
 * Idempotent sample submissions for a fixed org + requisition in your DB.
 */
import type { Prisma, PrismaClient } from "@repo/db";
import {
	CandidateComplianceStatus,
	ComplianceListItemCategory,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	MemberRole,
	OrganizationIndustry,
	OrganizationMemberStatus,
	OrganizationVendorStatus,
	QuestionType,
	ShiftType,
	SubmissionStage,
	TagStatus,
	TagType,
	UserRole,
} from "@repo/db";

/** Target organization (must exist). */
const SEED_TARGET_ORGANIZATION_ID = "a7769fe4-fd0a-4cba-83e3-061f3203ba84";

/** Target requisition (must exist and belong to the org above). */
const SEED_TARGET_REQUISITION_ID = "42a4a9a9-e23a-4f53-a798-782b64c64141";

/** `Submission.rtos` — JSON array of RTO ranges only (no questionnaires/compliance). */
const SEED_RTOS_ONLY: Prisma.InputJsonValue = [
	{ startDate: "2025-03-15", endDate: "2025-03-17" },
	{ startDate: "2025-04-10", endDate: "2025-04-12" },
];

const SEED_PRIORITY_TAG_NAMES = [
	"Location",
	"Schedule Flexibility",
	"Compensation",
] as const;

/** Demo wallet rows: tied to `compliance_list_item` by name (created if missing). */
const SEED_COMPLIANCE_DOCS: {
	listItemName: string;
	listCategory: ComplianceListItemCategory;
	documentFileName: string;
	status: CandidateComplianceStatus;
	uploadedAt: Date;
}[] = [
	{
		listItemName: "RN License",
		listCategory: ComplianceListItemCategory.LICENSES,
		documentFileName: "RN_License_MA_2025.pdf",
		status: CandidateComplianceStatus.APPROVED,
		uploadedAt: new Date("2025-01-10T12:00:00.000Z"),
	},
	{
		listItemName: "BLS Certification",
		listCategory: ComplianceListItemCategory.CERTIFICATIONS,
		documentFileName: "BLS_Cert_2025.pdf",
		status: CandidateComplianceStatus.APPROVED,
		uploadedAt: new Date("2025-01-10T12:00:00.000Z"),
	},
	{
		listItemName: "ACLS Certification",
		listCategory: ComplianceListItemCategory.CERTIFICATIONS,
		documentFileName: "ACLS_Cert_2025.pdf",
		status: CandidateComplianceStatus.APPROVED,
		uploadedAt: new Date("2025-01-11T12:00:00.000Z"),
	},
	{
		listItemName: "Physical Exam",
		listCategory: ComplianceListItemCategory.EMPLOYEE_HEALTH,
		documentFileName: "Physical_Exam_2025.pdf",
		status: CandidateComplianceStatus.APPROVED,
		uploadedAt: new Date("2025-01-12T12:00:00.000Z"),
	},
];

async function ensureDemoComplianceListItem(
	prisma: PrismaClient,
	name: string,
	category: ComplianceListItemCategory,
): Promise<string> {
	const existing = await prisma.complianceListItem.findFirst({
		where: { name },
		select: { id: true },
	});
	if (existing) {
		return existing.id;
	}
	const created = await prisma.complianceListItem.create({
		data: {
			name,
			category,
			expirationType: ComplianceListItemExpirationType.NON_EXPIRABLE,
			responseStyle: ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD,
			displayToCandidate: true,
		},
		select: { id: true },
	});
	return created.id;
}

async function seedCandidateComplianceAndPriorityTags(
	prisma: PrismaClient,
	candidateId: string,
): Promise<void> {
	for (const doc of SEED_COMPLIANCE_DOCS) {
		const complianceListItemId = await ensureDemoComplianceListItem(
			prisma,
			doc.listItemName,
			doc.listCategory,
		);
		const existing = await prisma.candidateCompliance.findFirst({
			where: { candidateId, complianceListItemId },
		});
		if (!existing) {
			await prisma.candidateCompliance.create({
				data: {
					candidateId,
					complianceListItemId,
					documentFileName: doc.documentFileName,
					status: doc.status,
					uploadedAt: doc.uploadedAt,
				},
			});
		}
	}

	for (const name of SEED_PRIORITY_TAG_NAMES) {
		const tag = await prisma.tag.upsert({
			where: {
				name_type: { name, type: TagType.PRIORITY },
			},
			create: {
				name,
				type: TagType.PRIORITY,
				showOnSubmission: true,
				status: TagStatus.ACTIVE,
			},
			update: {},
		});
		await prisma.candidateTag.upsert({
			where: {
				candidateId_tagId: { candidateId, tagId: tag.id },
			},
			create: { candidateId, tagId: tag.id },
			update: {},
		});
	}
}

type DemoRequisitionPick = {
	id: string;
	organizationOccupationId: string | null;
	organizationSpecialtyId: string | null;
};

async function ensureDemoQuestionnaires(
	prisma: PrismaClient,
	orgId: string,
	occupationId: string,
	requisition: DemoRequisitionPick,
): Promise<{ occQuestionnaireId: string; specQuestionnaireId: string } | null> {
	const orgOcc = requisition.organizationOccupationId
		? await prisma.organizationOccupation.findUnique({
				where: { id: requisition.organizationOccupationId },
				select: { id: true },
			})
		: await prisma.organizationOccupation.upsert({
				where: {
					organizationId_occupationId: { organizationId: orgId, occupationId },
				},
				create: { organizationId: orgId, occupationId },
				update: {},
				select: { id: true },
			});

	if (!orgOcc) {
		return null;
	}

	let orgSpecRow = requisition.organizationSpecialtyId
		? await prisma.organizationSpecialty.findUnique({
				where: { id: requisition.organizationSpecialtyId },
				select: { id: true },
			})
		: null;

	if (!orgSpecRow) {
		let specialty = await prisma.specialty.findFirst({
			where: { acronym: "PICU-SEED" },
		});
		if (!specialty) {
			specialty = await prisma.specialty.create({
				data: { name: "Pediatric ICU (Seed)", acronym: "PICU-SEED" },
			});
		}
		orgSpecRow = await prisma.organizationSpecialty.findFirst({
			where: {
				organizationId: orgId,
				specialtyId: specialty.id,
			},
			select: { id: true },
		});
		if (!orgSpecRow) {
			orgSpecRow = await prisma.organizationSpecialty.create({
				data: {
					organizationId: orgId,
					specialtyId: specialty.id,
					organizationOccupationId: orgOcc.id,
				},
				select: { id: true },
			});
		}
	}

	let occQ = await prisma.questionnaire.findFirst({
		where: { occupationId: orgOcc.id },
	});
	if (!occQ) {
		occQ = await prisma.questionnaire.create({
			data: {
				organizationId: orgId,
				occupationId: orgOcc.id,
				active: true,
			},
		});
	}

	const occDefs = [
		{
			order: 1,
			questionText: "Do you hold a current compact nursing license?",
			type: QuestionType.RADIO_BUTTON,
			options: ["Yes", "No"] as string[],
			required: true,
		},
		{
			order: 2,
			questionText: "Years of experience in acute care?",
			type: QuestionType.TEXT,
			options: [] as string[],
			required: false,
		},
	];

	for (const def of occDefs) {
		const existing = await prisma.question.findFirst({
			where: {
				questionnaireId: occQ.id,
				questionText: def.questionText,
			},
		});
		if (!existing) {
			await prisma.question.create({
				data: {
					questionnaireId: occQ.id,
					order: def.order,
					questionText: def.questionText,
					type: def.type,
					options: def.options,
					required: def.required,
					includeInSubmission: true,
				},
			});
		}
	}

	let specQ = await prisma.questionnaire.findFirst({
		where: { specialtyId: orgSpecRow.id },
	});
	if (!specQ) {
		specQ = await prisma.questionnaire.create({
			data: {
				organizationId: orgId,
				specialtyId: orgSpecRow.id,
				active: true,
			},
		});
	}

	const specQuestionText =
		"Describe experience with pediatric ventilator management.";
	const specExisting = await prisma.question.findFirst({
		where: { questionnaireId: specQ.id, questionText: specQuestionText },
	});
	if (!specExisting) {
		await prisma.question.create({
			data: {
				questionnaireId: specQ.id,
				order: 1,
				questionText: specQuestionText,
				type: QuestionType.TEXT,
				options: [],
				required: false,
				includeInSubmission: true,
			},
		});
	}

	return { occQuestionnaireId: occQ.id, specQuestionnaireId: specQ.id };
}

async function seedCandidateQuestionnaireResponsesForDemo(
	prisma: PrismaClient,
	candidateId: string,
	occQuestionnaireId: string,
	specQuestionnaireId: string,
): Promise<void> {
	const questions = await prisma.question.findMany({
		where: {
			questionnaireId: { in: [occQuestionnaireId, specQuestionnaireId] },
			includeInSubmission: true,
		},
	});

	const answers: Record<string, string> = {
		"Do you hold a current compact nursing license?": "Yes",
		"Years of experience in acute care?":
			"5 years in ICU step-down and med-surg.",
		"Describe experience with pediatric ventilator management.":
			"3+ years PICU; daily vent checks, weaning protocols, and family education.",
	};

	for (const q of questions) {
		const value = answers[q.questionText] ?? "—";
		await prisma.candidateQuestionnaireResponse.upsert({
			where: {
				candidateId_questionId: { candidateId, questionId: q.id },
			},
			create: { candidateId, questionId: q.id, value },
			update: { value },
		});
	}
}

const SEED_SUMMARY_NOTE =
	"This candidate is an experienced Pediatric ICU nurse with 5+ years of specialized experience. They have strong technical skills with ventilators and are certified in both BLS and ACLS. Their experience with Epic and Cerner EHR systems will be valuable for our facility. They are available to start on February 1st and have requested two periods of time off in March and April. All compliance documents are current and complete. Recommended for interview based on strong qualifications and experience match.";

const SEED_SUBMITTED_AT = new Date("2025-01-18T12:00:00.000Z");

function hoursAgo(hours: number): Date {
	return new Date(Date.now() - Math.round(hours * 60 * 60 * 1000));
}

type SeedSubmissionSpec = {
	email: string;
	name: string;
	stage: SubmissionStage;
	stageEnteredHoursAgo: number;
};

const SEED_ROWS: SeedSubmissionSpec[] = [
	// --- SUBMITTED (48h SLA): 2 OVERDUE, 2 NEAR, 4 WITHIN ---
	{
		email: "seed.aging.sub.overdue.1@example.invalid",
		name: "Aging Demo — Submitted OVERDUE (55h)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 55,
	},
	{
		email: "seed.aging.sub.overdue.2@example.invalid",
		name: "Aging Demo — Submitted OVERDUE (72h)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 72,
	},
	{
		email: "seed.aging.sub.near.1@example.invalid",
		name: "Aging Demo — Submitted NEAR (~6h left)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 42,
	},
	{
		email: "seed.aging.sub.near.2@example.invalid",
		name: "Aging Demo — Submitted NEAR (~10h left)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 38,
	},
	{
		email: "seed.aging.sub.within.1@example.invalid",
		name: "Aging Demo — Submitted WITHIN (~30h left)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 18,
	},
	{
		email: "seed.aging.sub.within.2@example.invalid",
		name: "Aging Demo — Submitted WITHIN (~24h left)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 24,
	},
	{
		email: "seed.submissions.submitted@example.invalid",
		name: "Seed Candidate Submitted (WITHIN)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 6,
	},
	{
		email: "seed.aging.sub.within.3@example.invalid",
		name: "Aging Demo — Submitted WITHIN (~40h left)",
		stage: SubmissionStage.SUBMITTED,
		stageEnteredHoursAgo: 8,
	},

	// --- QUALIFIED (72h SLA): OVERDUE / NEAR / WITHIN mix ---
	{
		email: "seed.aging.qu.overdue@example.invalid",
		name: "Aging Demo — Qualified OVERDUE",
		stage: SubmissionStage.QUALIFIED,
		stageEnteredHoursAgo: 90,
	},
	{
		email: "seed.aging.qu.near@example.invalid",
		name: "Aging Demo — Qualified NEAR",
		stage: SubmissionStage.QUALIFIED,
		stageEnteredHoursAgo: 68,
	},
	{
		email: "seed.aging.qu.within.1@example.invalid",
		name: "Aging Demo — Qualified WITHIN A",
		stage: SubmissionStage.QUALIFIED,
		stageEnteredHoursAgo: 24,
	},
	{
		email: "seed.submissions.qualified@example.invalid",
		name: "Seed Candidate Qualified (WITHIN)",
		stage: SubmissionStage.QUALIFIED,
		stageEnteredHoursAgo: 12,
	},

	// --- SHORTLISTED (72h SLA) ---
	{
		email: "seed.aging.sh.overdue@example.invalid",
		name: "Aging Demo — Shortlisted OVERDUE",
		stage: SubmissionStage.SHORTLISTED,
		stageEnteredHoursAgo: 85,
	},
	{
		email: "seed.aging.sh.near@example.invalid",
		name: "Aging Demo — Shortlisted NEAR",
		stage: SubmissionStage.SHORTLISTED,
		stageEnteredHoursAgo: 66,
	},
	{
		email: "seed.submissions.shortlisted@example.invalid",
		name: "Seed Candidate Shortlisted (WITHIN)",
		stage: SubmissionStage.SHORTLISTED,
		stageEnteredHoursAgo: 20,
	},

	// --- INTERVIEW_SCHEDULED / COMPLETED (48h SLA) ---
	{
		email: "seed.aging.is.overdue@example.invalid",
		name: "Aging Demo — Interview Scheduled OVERDUE",
		stage: SubmissionStage.INTERVIEW_SCHEDULED,
		stageEnteredHoursAgo: 55,
	},
	{
		email: "seed.aging.is.near@example.invalid",
		name: "Aging Demo — Interview Scheduled NEAR",
		stage: SubmissionStage.INTERVIEW_SCHEDULED,
		stageEnteredHoursAgo: 40,
	},
	{
		email: "seed.submissions.interview_scheduled@example.invalid",
		name: "Seed Candidate Interview Scheduled (WITHIN)",
		stage: SubmissionStage.INTERVIEW_SCHEDULED,
		stageEnteredHoursAgo: 8,
	},
	{
		email: "seed.aging.ic.overdue@example.invalid",
		name: "Aging Demo — Interview Completed OVERDUE",
		stage: SubmissionStage.INTERVIEW_COMPLETED,
		stageEnteredHoursAgo: 54,
	},
	{
		email: "seed.aging.ic.near@example.invalid",
		name: "Aging Demo — Interview Completed NEAR",
		stage: SubmissionStage.INTERVIEW_COMPLETED,
		stageEnteredHoursAgo: 41,
	},
	{
		email: "seed.submissions.interview_completed@example.invalid",
		name: "Seed Candidate Interview Completed (WITHIN)",
		stage: SubmissionStage.INTERVIEW_COMPLETED,
		stageEnteredHoursAgo: 10,
	},

	// --- OFFERED (72h SLA) ---
	{
		email: "seed.aging.of.overdue@example.invalid",
		name: "Aging Demo — Offered OVERDUE",
		stage: SubmissionStage.OFFERED,
		stageEnteredHoursAgo: 88,
	},
	{
		email: "seed.aging.of.near@example.invalid",
		name: "Aging Demo — Offered NEAR",
		stage: SubmissionStage.OFFERED,
		stageEnteredHoursAgo: 67,
	},
	{
		email: "seed.submissions.offered@example.invalid",
		name: "Seed Candidate Offered (WITHIN)",
		stage: SubmissionStage.OFFERED,
		stageEnteredHoursAgo: 24,
	},

	// --- Terminal (no SLA clock; count as WITHIN) ---
	{
		email: "seed.submissions.accepted@example.invalid",
		name: "Seed Candidate Accepted",
		stage: SubmissionStage.ACCEPTED,
		stageEnteredHoursAgo: 120,
	},
	{
		email: "seed.submissions.withdrawn@example.invalid",
		name: "Seed Candidate Withdrawn",
		stage: SubmissionStage.WITHDRAWN,
		stageEnteredHoursAgo: 96,
	},
	{
		email: "seed.submissions.rejected@example.invalid",
		name: "Seed Candidate Rejected",
		stage: SubmissionStage.REJECTED,
		stageEnteredHoursAgo: 72,
	},
];

export async function seedOrgSubmissionsDemo(
	prisma: PrismaClient,
	options: { seedAdminEmail: string },
): Promise<void> {
	const admin = await prisma.user.findUnique({
		where: { email: options.seedAdminEmail },
		select: { id: true },
	});
	if (!admin) {
		console.log(
			"seedOrgSubmissionsDemo: skipped (seed admin user not found yet)",
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
			organizationOccupationId: true,
			organizationSpecialtyId: true,
			organizationOccupation: { select: { occupationId: true } },
		},
	});

	if (!requisition) {
		console.log(
			"seedOrgSubmissionsDemo: skipped — requisition not found or org mismatch " +
				`(org=${SEED_TARGET_ORGANIZATION_ID}, req=${SEED_TARGET_REQUISITION_ID})`,
		);
		return;
	}

	await prisma.requisition.update({
		where: { id: requisition.id },
		data: {
			startDate: new Date("2026-01-05T12:00:00.000Z"),
			endDate: new Date("2026-04-05T12:00:00.000Z"),
			billRate: 95,
			shiftType: ShiftType.NIGHTS,
			hoursPerWeek: 36,
			startTime: "7:00 PM",
			endTime: "7:00 AM",
			shiftsPerWeek: 3,
		},
	});

	const orgId = SEED_TARGET_ORGANIZATION_ID;

	let occupationId = requisition.organizationOccupation?.occupationId;
	if (!occupationId) {
		let occupation = await prisma.occupation.findFirst({
			where: { code: "SEED_RN" },
		});
		if (!occupation) {
			occupation = await prisma.occupation.create({
				data: {
					name: "Registered Nurse (Seed)",
					code: "SEED_RN",
					acronym: "RN",
					industry: OrganizationIndustry.HEALTHCARE,
				},
			});
		}
		occupationId = occupation.id;
	}

	const vendor = await prisma.vendor.upsert({
		where: { internalId: "seed-vendor-submissions-demo" },
		create: {
			name: "Seed Staffing Co",
			internalId: "seed-vendor-submissions-demo",
			industries: [OrganizationIndustry.HEALTHCARE],
		},
		update: { name: "Seed Staffing Co" },
	});

	const orgVendor = await prisma.organizationVendor.findFirst({
		where: { organizationId: orgId, vendorId: vendor.id },
	});
	if (!orgVendor) {
		await prisma.organizationVendor.create({
			data: {
				organizationId: orgId,
				vendorId: vendor.id,
				status: OrganizationVendorStatus.ACTIVE,
			},
		});
	}

	const member = await prisma.member.findFirst({
		where: { organizationId: orgId, userId: admin.id },
	});
	if (!member) {
		await prisma.member.create({
			data: {
				organizationId: orgId,
				userId: admin.id,
				role: MemberRole.EXECUTIVE,
				status: OrganizationMemberStatus.ACTIVE,
			},
		});
	}

	const questionnaireIds = await ensureDemoQuestionnaires(
		prisma,
		orgId,
		occupationId,
		{
			id: requisition.id,
			organizationOccupationId: requisition.organizationOccupationId,
			organizationSpecialtyId: requisition.organizationSpecialtyId,
		},
	);

	for (const row of SEED_ROWS) {
		const user = await prisma.user.upsert({
			where: { email: row.email },
			create: {
				email: row.email,
				name: row.name,
				role: UserRole.CANDIDATE_USER,
				emailVerified: true,
				phoneNumber: "(555) 123-4567",
			},
			update: {
				name: row.name,
				phoneNumber: "(555) 123-4567",
			},
		});

		const candidate = await prisma.candidate.upsert({
			where: { userId: user.id },
			create: {
				userId: user.id,
				occupationId,
				organizationId: orgId,
				vendorId: vendor.id,
				streetAddress: "123 Main St",
				city: "Boston",
				state: "MA",
				zipCode: "02108",
				yearsOfExperience: 5,
				preferredShiftTypes: ["Night Shift", "12-hour shifts"],
				availableFrom: new Date("2025-02-01T12:00:00.000Z"),
			},
			update: {
				organizationId: orgId,
				vendorId: vendor.id,
				occupationId,
				streetAddress: "123 Main St",
				city: "Boston",
				state: "MA",
				zipCode: "02108",
				yearsOfExperience: 5,
				preferredShiftTypes: ["Night Shift", "12-hour shifts"],
				availableFrom: new Date("2025-02-01T12:00:00.000Z"),
			},
		});

		await seedCandidateComplianceAndPriorityTags(prisma, candidate.id);

		if (questionnaireIds) {
			await seedCandidateQuestionnaireResponsesForDemo(
				prisma,
				candidate.id,
				questionnaireIds.occQuestionnaireId,
				questionnaireIds.specQuestionnaireId,
			);
		}

		const stageEnteredAt = hoursAgo(row.stageEnteredHoursAgo);

		const existing = await prisma.submission.findFirst({
			where: {
				candidateId: candidate.id,
				requisitionId: requisition.id,
			},
		});

		if (existing) {
			await prisma.submission.update({
				where: { id: existing.id },
				data: {
					organizationId: orgId,
					stage: row.stage,
					stageEnteredAt,
					vendorId: vendor.id,
					billingRate: 95,
					submittedAt: SEED_SUBMITTED_AT,
					summaryNote: SEED_SUMMARY_NOTE,
					rtos: SEED_RTOS_ONLY,
				},
			});
		} else {
			await prisma.submission.create({
				data: {
					organizationId: orgId,
					requisitionId: requisition.id,
					candidateId: candidate.id,
					vendorId: vendor.id,
					stage: row.stage,
					stageEnteredAt,
					submittedAt: SEED_SUBMITTED_AT,
					billingRate: 95,
					summaryNote: SEED_SUMMARY_NOTE,
					rtos: SEED_RTOS_ONLY,
				},
			});
		}
	}

	console.log(
		`seedOrgSubmissionsDemo: org=${orgId} req=${requisition.id} — ${SEED_ROWS.length} submissions (idempotent)`,
	);
}

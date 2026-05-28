import type {
	PlacementComplianceItem,
	PlacementNote,
	PlacementOfferHistory,
	PlacementTask,
} from "@repo/db";
import {
	CandidateComplianceStatus,
	OfferEventType,
	PlacementTaskStatus,
} from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID, getCandidatesDataset } from "./candidates";
import { COMPLIANCE_ITEM_ID } from "./compliance";
import { getComplianceWalletsDataset } from "./compliance-wallets";
import { OCCUPATION_ID, type OccupationAcronym } from "./occupations";
import { getPlacementsDataset, PLACEMENT_ID } from "./placements";
import { SPECIALTY_ID, type SpecialtyAcronym } from "./specialties";
import { USER_ID } from "./users";

interface PlacementCandidateMapping {
	pid: string;
	candidateId: string;
	userId: string;
	complianceOverride?: Record<string, CandidateComplianceStatus>;
}

export const PLACEMENT_CANDIDATE_MAP: PlacementCandidateMapping[] = [
	{
		pid: PLACEMENT_ID.ISABELLE,
		candidateId: CANDIDATE_ID.ISABELLE,
		userId: USER_ID.ISABELLE,
	},
	{
		pid: PLACEMENT_ID.MARCUS,
		candidateId: CANDIDATE_ID.MARCUS,
		userId: USER_ID.MARCUS,
	},
	{
		pid: PLACEMENT_ID.ELENA,
		candidateId: CANDIDATE_ID.ELENA,
		userId: USER_ID.ELENA,
	},
	{
		pid: PLACEMENT_ID.DAVID,
		candidateId: CANDIDATE_ID.DAVID,
		userId: USER_ID.DAVID_W_CAND,
	},
	{
		pid: PLACEMENT_ID.SARAH,
		candidateId: CANDIDATE_ID.SARAH,
		userId: USER_ID.SARAH,
	},
	{
		pid: PLACEMENT_ID.MICHAEL,
		candidateId: CANDIDATE_ID.MICHAEL,
		userId: USER_ID.MICHAEL,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.JAMES,
		candidateId: CANDIDATE_ID.JAMES,
		userId: USER_ID.JAMES,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.RN_LICENSE]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.ACLS]: CandidateComplianceStatus.PENDING_REVIEW,
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.EMILY,
		candidateId: CANDIDATE_ID.EMILY_R_TALENT,
		userId: USER_ID.EMILY_R_TALENT,
	},
	{
		pid: PLACEMENT_ID.JENNIFER,
		candidateId: CANDIDATE_ID.JENNIFER,
		userId: USER_ID.JENNIFER_W,
	},
	{
		pid: PLACEMENT_ID.KEVIN,
		candidateId: CANDIDATE_ID.CHRIS_L_TALENT,
		userId: USER_ID.CHRIS_L_TALENT,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.RN_LICENSE]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.ACLS]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.PALS]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.TB_TEST]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.DRUG_SCREENING]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.FLU_VACCINE]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.REFERENCE_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.ICU_COMPETENCY]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.ROBERT_KIM,
		candidateId: CANDIDATE_ID.ROBERT_T_INVITED,
		userId: USER_ID.ROBERT_T_INVITED,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.RN_LICENSE]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.ACLS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.PALS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.TB_TEST]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.DRUG_SCREENING]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.FLU_VACCINE]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.REFERENCE_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.ICU_COMPETENCY]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.AMANDA_FOSTER,
		candidateId: CANDIDATE_ID.AMANDA_B_TALENT,
		userId: USER_ID.AMANDA_B_TALENT,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.RN_LICENSE]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.ACLS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.PALS]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.TB_TEST]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.DRUG_SCREENING]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.FLU_VACCINE]: CandidateComplianceStatus.APPROVED,
			[COMPLIANCE_ITEM_ID.REFERENCE_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.ICU_COMPETENCY]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.LISA_D,
		candidateId: CANDIDATE_ID.LISA_D_NEW,
		userId: USER_ID.LISA_D_NEW,
	},
	{
		pid: PLACEMENT_ID.QUINN_MARCUS_V,
		candidateId: CANDIDATE_ID.MARCUS_V,
		userId: USER_ID.QUINN_MARCUS_V,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.PENDING_REVIEW,
		},
	},
	{
		pid: PLACEMENT_ID.QUINN_SARAH_P,
		candidateId: CANDIDATE_ID.SARAH_P,
		userId: USER_ID.QUINN_SARAH_P,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.RN_LICENSE]: CandidateComplianceStatus.PENDING_REVIEW,
			[COMPLIANCE_ITEM_ID.BLS]: CandidateComplianceStatus.MISSING,
		},
	},
	{
		pid: PLACEMENT_ID.QUINN_DAVID_L,
		candidateId: CANDIDATE_ID.DAVID_L,
		userId: USER_ID.QUINN_DAVID_L,
		complianceOverride: {
			[COMPLIANCE_ITEM_ID.LPN_LICENSE]: CandidateComplianceStatus.EXPIRED,
			[COMPLIANCE_ITEM_ID.BACKGROUND_CHECK]: CandidateComplianceStatus.MISSING,
			[COMPLIANCE_ITEM_ID.DRIVERS_LICENSE]: CandidateComplianceStatus.MISSING,
		},
	},
];

export const getPlacementExtrasDataset = (organizationId: string) => {
	const placements = getPlacementsDataset(organizationId);
	const candidates = getCandidatesDataset();
	const wallets = getComplianceWalletsDataset();
	const notes: Omit<PlacementNote, "updatedAt">[] = [];
	const tasks: Omit<PlacementTask, "updatedAt">[] = [];
	const offerHistory: Omit<PlacementOfferHistory, "updatedAt">[] = [];
	const complianceItems: Omit<
		PlacementComplianceItem,
		"createdAt" | "updatedAt" | "removedAt"
	>[] = [];

	for (const entry of PLACEMENT_CANDIDATE_MAP) {
		const { pid, userId, candidateId } = entry;
		const placement = placements.find((p: { id: string }) => p.id === pid);
		const candidate = candidates.find((c) => c.id === candidateId);

		if (!placement || !candidate)
			throw new Error(`Placement ${pid} or Candidate ${candidateId} not found`);

		let occAcronym: OccupationAcronym | null = null;
		for (const [key, val] of Object.entries(OCCUPATION_ID)) {
			if (val === candidate.occupationId) {
				occAcronym = key as OccupationAcronym;
				break;
			}
		}

		const candidateSpecAcronyms = new Set<SpecialtyAcronym>();
		if (candidate.specialtyIds) {
			for (const sid of candidate.specialtyIds) {
				for (const [key, val] of Object.entries(SPECIALTY_ID)) {
					if (val === sid) {
						candidateSpecAcronyms.add(key as SpecialtyAcronym);
					}
				}
			}
		}

		const requiredItemIds = new Set<string>();
		for (const wallet of wallets) {
			if (wallet.occupationAcronym === occAcronym) {
				if (
					wallet.specialtyAcronym === null ||
					candidateSpecAcronyms.has(wallet.specialtyAcronym)
				) {
					for (const itemId of wallet.itemIds) {
						requiredItemIds.add(itemId);
					}
				}
			}
		}

		const suffix = pid.split("-").pop();

		notes.push(
			{
				id: getDeterministicId(`${SEED_PREFIX}note-1-${suffix}`),
				placementId: pid,
				content:
					"Candidate has integrated well with the team. Positive feedback received.",
				createdById: USER_ID.BOB_J,
				createdByRole: "Hiring Manager",
				createdAt: new Date("2026-01-22T10:00:00Z"),
			},
			{
				id: getDeterministicId(`${SEED_PREFIX}note-2-${suffix}`),
				placementId: pid,
				content: "Completed initial orientation and unit-specific training.",
				createdById: USER_ID.DAVID_J,
				createdByRole: "Program Director",
				createdAt: new Date("2026-01-15T09:00:00Z"),
			},
		);

		tasks.push(
			{
				id: getDeterministicId(`${SEED_PREFIX}task-1-${suffix}`),
				placementId: pid,
				title: "Schedule mid-assignment review",
				description: "Discuss clinical performance and potential extension.",
				dueDate: new Date("2026-02-15T17:00:00Z"),
				status: PlacementTaskStatus.PENDING,
				assignedToId: USER_ID.BOB_J,
				assignedRole: null,
				createdById: USER_ID.DAVID_J,
				createdAt: new Date("2026-01-20T11:00:00Z"),
				completedAt: null,
			},
			{
				id: getDeterministicId(`${SEED_PREFIX}task-2-${suffix}`),
				placementId: pid,
				title: "Verify credential updates",
				description: "Check for any expiring certifications.",
				dueDate: new Date("2026-02-01T17:00:00Z"),
				status: PlacementTaskStatus.PENDING,
				assignedToId: USER_ID.DAVID_W,
				assignedRole: null,
				createdById: USER_ID.ALICE,
				createdAt: new Date("2026-01-15T09:00:00Z"),
				completedAt: null,
			},
		);

		const historyBase: Omit<PlacementOfferHistory, "updatedAt">[] = [
			{
				id: getDeterministicId(`${SEED_PREFIX}history-1-${suffix}`),
				placementId: pid,
				eventType: OfferEventType.OFFER_EXTENDED,
				description: "Initial offer sent to candidate",
				billRateSnapshot: placement.billRate,
				payRateSnapshot: placement.payRate,
				startDateSnapshot: placement.startDate,
				performedById: USER_ID.BOB_J,
				performedAt: new Date("2025-12-05T10:30:00Z"),
				employmentType: placement.employmentType,
			},
			{
				id: getDeterministicId(`${SEED_PREFIX}history-2-${suffix}`),
				placementId: pid,
				eventType: OfferEventType.OFFER_VIEWED,
				description: "Candidate viewed offer details",
				billRateSnapshot: null,
				payRateSnapshot: null,
				startDateSnapshot: null,
				performedById: userId,
				performedAt: new Date("2025-12-06T14:15:00Z"),
				employmentType: null,
			},
			{
				id: getDeterministicId(`${SEED_PREFIX}history-3-${suffix}`),
				placementId: pid,
				eventType: OfferEventType.OFFER_ACCEPTED,
				description: "Candidate accepted offer",
				billRateSnapshot: placement.billRate,
				payRateSnapshot: placement.payRate,
				startDateSnapshot: placement.startDate,
				performedById: userId,
				performedAt: new Date("2025-12-07T08:45:00Z"),
				employmentType: placement.employmentType,
			},
			{
				id: getDeterministicId(`${SEED_PREFIX}history-4-${suffix}`),
				placementId: pid,
				eventType: OfferEventType.PLACEMENT_CREATED,
				description: "Placement record finalized",
				billRateSnapshot: placement.billRate,
				payRateSnapshot: placement.payRate,
				startDateSnapshot: placement.startDate,
				performedById: USER_ID.ALICE,
				performedAt: new Date("2025-12-08T11:00:00Z"),
				employmentType: placement.employmentType,
			},
		];

		if (pid === PLACEMENT_ID.DAVID) {
			historyBase.push({
				id: getDeterministicId(`${SEED_PREFIX}history-5-${suffix}`),
				placementId: pid,
				eventType: OfferEventType.OFFER_EXTENDED,
				description: "Placement extension offered",
				billRateSnapshot: placement.billRate + 5,
				payRateSnapshot: placement.payRate + 3.75,
				startDateSnapshot: new Date("2027-01-01"),
				performedById: USER_ID.BOB_J,
				performedAt: new Date("2026-06-15T09:00:00Z"),
				employmentType: placement.employmentType,
			});
		}

		offerHistory.push(...historyBase);

		for (const itemId of requiredItemIds) {
			complianceItems.push({
				id: getDeterministicId(`${SEED_PREFIX}p-comp-${suffix}-${itemId}`),
				placementId: pid,
				complianceListItemId: itemId,
				source: "PLACEMENT_EXTRA",
				isRequired: true,
			});
		}
	}

	return {
		notes,
		tasks,
		offerHistory,
		complianceItems,
	};
};

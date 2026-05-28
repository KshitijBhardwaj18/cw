import type { Subjects } from "@casl/prisma";
import type {
	Account,
	ActivityLogOrg,
	Address,
	AgingRule,
	BackGroundJob,
	BillingConfig,
	Candidate,
	CandidateCompliance,
	CandidatePreferredLocation,
	CandidateQuestionnaireResponse,
	CandidateSavedRequisition,
	CandidateSpecialty,
	CandidateSummary,
	CandidateTag,
	ComplianceChecklist,
	ComplianceChecklistItem,
	ComplianceListItem,
	ComplianceWalletTemplate,
	ComplianceWalletTemplateItem,
	CredentialExpirySummary,
	Department,
	DepartmentTimekeepingApprover,
	DepartmentUser,
	Document,
	Grievance,
	GrievanceTask,
	Invoice,
	InvoiceLineItem,
	MatchingCriterion,
	MatchingLogic,
	Member,
	Metric,
	MissingTimeCase,
	MSP,
	MSPLinkedOrg,
	Note,
	NotificationOrg,
	Occupation,
	OccupationSpecialty,
	Organization,
	OrganizationHoliday,
	OrganizationLocation,
	OrganizationMetric,
	OrganizationOccupation,
	OrganizationPayCode,
	OrganizationSpecialty,
	OrganizationVendor,
	OrganizationWorkforceBillingRate,
	PerDiemAssignment,
	PerDiemShift,
	Placement,
	PlacementComplianceItem,
	PlacementNote,
	PlacementOfferHistory,
	PlacementSummary,
	PlacementTask,
	Project,
	Question,
	Questionnaire,
	Requisition,
	RequisitionAcceptanceCriterion,
	RequisitionAttentionRule,
	RequisitionTemplate,
	RequisitionTemplateVendor,
	RequisitionVendor,
	Session,
	ShiftRoutingTier,
	ShiftTemplate,
	Specialty,
	Submission,
	SubmissionInterviewer,
	Tag,
	TaggingRule,
	TaggingRuleQuestion,
	TimekeepingPolicy,
	TimekeepingSummary,
	Timesheet,
	TimesheetDispute,
	TimesheetEntry,
	User,
	Vendor,
	VendorOccupationSpecialization,
	VendorUser,
	VendorUserSavedRequisition,
	Verification,
	WorkforceListMember,
} from "@repo/db";

export type AppSubjects =
	| Subjects<{
			Account: Account;
			ActivityLogOrg: ActivityLogOrg;
			Address: Address;
			AgingRule: AgingRule;
			BackGroundJob: BackGroundJob;
			BillingConfig: BillingConfig;
			Candidate: Candidate;
			CandidateCompliance: CandidateCompliance;
			CandidatePreferredLocation: CandidatePreferredLocation;
			CandidateQuestionnaireResponse: CandidateQuestionnaireResponse;
			CandidateSavedRequisition: CandidateSavedRequisition;
			CandidateSpecialty: CandidateSpecialty;
			CandidateSummary: CandidateSummary;
			CandidateTag: CandidateTag;
			ComplianceChecklist: ComplianceChecklist;
			ComplianceChecklistItem: ComplianceChecklistItem;
			ComplianceListItem: ComplianceListItem;
			ComplianceWalletTemplate: ComplianceWalletTemplate;
			ComplianceWalletTemplateItem: ComplianceWalletTemplateItem;
			CredentialExpirySummary: CredentialExpirySummary;
			Department: Department;
			DepartmentTimekeepingApprover: DepartmentTimekeepingApprover;
			DepartmentUser: DepartmentUser;
			Document: Document;
			Grievance: Grievance;
			GrievanceTask: GrievanceTask;
			Invoice: Invoice;
			InvoiceLineItem: InvoiceLineItem;
			MSP: MSP;
			MSPLinkedOrg: MSPLinkedOrg;
			MatchingCriterion: MatchingCriterion;
			MatchingLogic: MatchingLogic;
			Member: Member;
			Metric: Metric;
			MissingTimeCase: MissingTimeCase;
			Note: Note;
			NotificationOrg: NotificationOrg;
			Occupation: Occupation;
			OccupationSpecialty: OccupationSpecialty;
			Organization: Organization;
			OrganizationHoliday: OrganizationHoliday;
			OrganizationLocation: OrganizationLocation;
			OrganizationMetric: OrganizationMetric;
			OrganizationOccupation: OrganizationOccupation;
			OrganizationPayCode: OrganizationPayCode;
			OrganizationSpecialty: OrganizationSpecialty;
			OrganizationVendor: OrganizationVendor;
			OrganizationWorkforceBillingRate: OrganizationWorkforceBillingRate;
			PerDiemAssignment: PerDiemAssignment;
			PerDiemShift: PerDiemShift;
			Placement: Placement;
			PlacementComplianceItem: PlacementComplianceItem;
			PlacementNote: PlacementNote;
			PlacementOfferHistory: PlacementOfferHistory;
			PlacementSummary: PlacementSummary;
			PlacementTask: PlacementTask;
			Project: Project;
			Question: Question;
			Questionnaire: Questionnaire;
			Requisition: Requisition;
			RequisitionAcceptanceCriterion: RequisitionAcceptanceCriterion;
			RequisitionAttentionRule: RequisitionAttentionRule;
			RequisitionTemplate: RequisitionTemplate;
			RequisitionTemplateVendor: RequisitionTemplateVendor;
			RequisitionVendor: RequisitionVendor;
			Session: Session;
			ShiftRoutingTier: ShiftRoutingTier;
			ShiftTemplate: ShiftTemplate;
			Specialty: Specialty;
			Submission: Submission;
			SubmissionInterviewer: SubmissionInterviewer;
			Tag: Tag;
			TaggingRule: TaggingRule;
			TaggingRuleQuestion: TaggingRuleQuestion;
			TimekeepingPolicy: TimekeepingPolicy;
			TimekeepingSummary: TimekeepingSummary;
			Timesheet: Timesheet;
			TimesheetDispute: TimesheetDispute;
			TimesheetEntry: TimesheetEntry;
			User: User;
			Vendor: Vendor;
			VendorOccupationSpecialization: VendorOccupationSpecialization;
			VendorUser: VendorUser;
			VendorUserSavedRequisition: VendorUserSavedRequisition;
			Verification: Verification;
			WorkforceListMember: WorkforceListMember;
	  }>
	| "CommandCenter"
	| "CandidateSubmission"
	| "TalentCommunity"
	| "WorkforceLists"
	| "ShiftRoutingSettings"
	| "Credentials"
	| "Timekeeping"
	| "RequisitionApprovals"
	| "Dashboard"
	| "SpendAnalytics"
	| "Billing"
	| "all";

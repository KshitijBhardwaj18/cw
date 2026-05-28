import {
	CANDIDATE_EXPERIENCE_BAND_OPTIONS,
	CandidateExperienceBand,
	CandidatePreferredContractLength,
	requiredPhoneSchema,
	SHIFT_TYPE_OPTIONS,
	ShiftType,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

const createAccountBaseSchema = z.object({
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

export const createAccountSchema = createAccountBaseSchema;

export { createAccountBaseSchema };

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const contactInformationSchema = z.object({
	phone: requiredPhoneSchema,
	streetAddress: z.string().trim().min(1, "Street address is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "ZIP code is required"),
});

export type ContactInformationFormValues = z.infer<
	typeof contactInformationSchema
>;

export const contactInformationPostalAutosuggestValidators = {
	street: contactInformationSchema.shape.streetAddress,
	city: contactInformationSchema.shape.city,
	state: contactInformationSchema.shape.state,
	zipCode: contactInformationSchema.shape.zipCode,
} as const;

export const professionalDetailsObjectSchema = z.object({
	occupationId: z.string().min(1, "Occupation is required"),
	specialtyIds: z.array(z.string()).min(1, "Select at least one specialty"),
	resumeFile: z.union([z.instanceof(File), z.null()]),
});

export const professionalDetailsSchema = professionalDetailsObjectSchema;

export type ProfessionalDetailsFormValues = z.infer<
	typeof professionalDetailsObjectSchema
>;

export const professionalDetailsInviteSchema = professionalDetailsSchema;

export type ProfessionalDetailsInviteFormValues = z.infer<
	typeof professionalDetailsInviteSchema
>;

export const locationPreferencesSchema = z.object({
	locationIds: z
		.array(z.string())
		.min(1, "Select at least one location where you're willing to work"),
});

export type LocationPreferencesFormValues = z.infer<
	typeof locationPreferencesSchema
>;

export const QUESTIONNAIRE_SHIFT_TYPE_OPTIONS = SHIFT_TYPE_OPTIONS;

export type QuestionnaireShiftTypeValue = ShiftType;

export const TOTAL_PROFESSIONAL_EXPERIENCE_BAND_LABELS = Object.fromEntries(
	CANDIDATE_EXPERIENCE_BAND_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CandidateExperienceBand, string>;

/** Kept as `CandidateExperienceBand[]` for UI loops (ordering matches options). */
export const TOTAL_PROFESSIONAL_EXPERIENCE_BANDS =
	CANDIDATE_EXPERIENCE_BAND_OPTIONS.map((o) => o.value);

export type TotalProfessionalExperienceBand = CandidateExperienceBand;

const questionnaireShiftTypeEnum = z.nativeEnum(ShiftType);

const totalProfessionalExperienceBandEnum = z.nativeEnum(
	CandidateExperienceBand,
);

export const preferencesQuestionnairesSchema = z.object({
	preferredContractLengths: z
		.array(z.nativeEnum(CandidatePreferredContractLength))
		.min(1, "Select at least one preferred contract length"),
	preferredShiftTypes: z
		.array(questionnaireShiftTypeEnum)
		.min(1, "Select at least one preferred shift type"),
	earliestStartDate: z.string().optional(),
	recentJobTitle: z.string().optional(),
	occupationEhrSystems: z.array(z.string()),
	occupationCertifications: z.array(z.string()),
	/** Set when user skips or saves the occupation questionnaire dialog (UI state). */
	occupationQuestionnaireCompleted: z.boolean().optional(),
	totalProfessionalExperienceBand: totalProfessionalExperienceBandEnum,
});

export type PreferencesQuestionnairesFormValues = z.infer<
	typeof preferencesQuestionnairesSchema
>;

/** Occupation specialty modal — optional multi-selects only */
export const occupationQuestionnaireDialogSchema = z.object({
	ehrSystems: z.array(z.string()),
	certifications: z.array(z.string()),
});

export type OccupationQuestionnaireDialogFormValues = z.infer<
	typeof occupationQuestionnaireDialogSchema
>;

export const professionalReferenceSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required"),
	title: z.string().trim().min(1, "Title is required"),
	organization: z.string().trim().min(1, "Organization is required"),
	relationship: z.string().trim().min(1, "Relationship is required"),
	phone: z.string().trim().min(1, "Phone is required"),
	email: z.string().trim().email("Enter a valid email"),
});

export type ProfessionalReferenceFormValues = z.infer<
	typeof professionalReferenceSchema
>;

export function emptyProfessionalReference(): ProfessionalReferenceFormValues {
	return {
		fullName: "",
		title: "",
		organization: "",
		relationship: "",
		phone: "",
		email: "",
	};
}

export const submissionReadinessBaseSchema = z.object({
	dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
	lastFourSsn: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
	skillsChecklistFile: z.instanceof(File).nullable(),
	skillsChecklistFileKey: z.string().nullable(),
	references: z.array(professionalReferenceSchema),
});

export const submissionReadinessSchema =
	submissionReadinessBaseSchema.superRefine((data, ctx) => {
		if (!data.skillsChecklistFile && !data.skillsChecklistFileKey) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Upload your skills checklist",
				path: ["skillsChecklistFile"],
			});
		}
	});

export type SubmissionReadinessFormValues = z.infer<
	typeof submissionReadinessBaseSchema
>;

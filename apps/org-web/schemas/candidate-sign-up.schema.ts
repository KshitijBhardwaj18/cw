import {
	CandidatePreferredContractLength,
	requiredPhoneSchema,
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
	yearsOfExperience: z
		.number({ invalid_type_error: "Enter a valid number" })
		.min(0, "Must be 0 or more")
		.max(50, "Must be 50 or less"),
	specialtyIds: z.array(z.string()),
	resumeFile: z.union([z.instanceof(File), z.null()]),
	preferredContractLengths: z.array(
		z.nativeEnum(CandidatePreferredContractLength),
	),
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

export const QUESTIONNAIRE_SHIFT_TYPE_OPTIONS = [
	{ value: "DAY", label: "Day" },
	{ value: "EVENING", label: "Evening" },
	{ value: "NIGHT", label: "Night" },
	{ value: "ROTATING", label: "Rotating" },
	{ value: "WEEKEND_ONLY", label: "Weekend only" },
] as const;

export type QuestionnaireShiftTypeValue =
	(typeof QUESTIONNAIRE_SHIFT_TYPE_OPTIONS)[number]["value"];

export const TOTAL_PROFESSIONAL_EXPERIENCE_BANDS = [
	"LT_1",
	"Y1_2",
	"Y3_5",
	"Y6_9",
	"Y10_PLUS",
] as const;

export type TotalProfessionalExperienceBand =
	(typeof TOTAL_PROFESSIONAL_EXPERIENCE_BANDS)[number];

export const TOTAL_PROFESSIONAL_EXPERIENCE_BAND_LABELS: Record<
	TotalProfessionalExperienceBand,
	string
> = {
	LT_1: "Less than 1 year",
	Y1_2: "1–2 years",
	Y3_5: "3–5 years",
	Y6_9: "6–9 years",
	Y10_PLUS: "10+ years",
};

const questionnaireShiftTypeEnum = z.enum([
	"DAY",
	"EVENING",
	"NIGHT",
	"ROTATING",
	"WEEKEND_ONLY",
]);

const totalProfessionalExperienceBandEnum = z.enum([
	"LT_1",
	"Y1_2",
	"Y3_5",
	"Y6_9",
	"Y10_PLUS",
]);

export const preferencesQuestionnairesSchema = z.object({
	preferredContractLengths: z.array(
		z.nativeEnum(CandidatePreferredContractLength),
	),
	preferredShiftTypes: z.array(questionnaireShiftTypeEnum),
	earliestStartDate: z.string().optional(),
	recentJobTitle: z.string().optional(),
	occupationEhrSystems: z.array(z.string()),
	occupationCertifications: z.array(z.string()),
	/** Set when user skips or saves the occupation questionnaire dialog (UI state). */
	occupationQuestionnaireCompleted: z.boolean().optional(),
	totalProfessionalExperienceBand:
		totalProfessionalExperienceBandEnum.optional(),
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
	skillsChecklistCompleted: z.boolean().optional(),
	dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
	lastFourSsn: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
	certificationFiles: z
		.array(z.instanceof(File))
		.min(1, "Upload at least one certification (PDF, JPG, or PNG)"),
	references: z
		.array(professionalReferenceSchema)
		.min(2, "Add at least two professional references"),
});

export const submissionReadinessSchema =
	submissionReadinessBaseSchema.superRefine((data, ctx) => {
		if (data.skillsChecklistCompleted !== true) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Complete the skills checklist",
				path: ["skillsChecklistCompleted"],
			});
		}
	});

export type SubmissionReadinessFormValues = z.infer<
	typeof submissionReadinessBaseSchema
>;

export function yearsOfExperienceToProfessionalBand(
	years: number | undefined,
): TotalProfessionalExperienceBand | undefined {
	if (years === undefined || Number.isNaN(years)) return undefined;
	if (years < 1) return "LT_1";
	if (years <= 2) return "Y1_2";
	if (years <= 5) return "Y3_5";
	if (years <= 9) return "Y6_9";
	return "Y10_PLUS";
}

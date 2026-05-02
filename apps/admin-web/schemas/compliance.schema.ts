import {
	ComplianceListItemCategory,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	ComplianceListItemStatus,
	ExpirationRuleUnit,
} from "@repo/shared";
import { z } from "zod";

export const ComplianceFormBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Compliance item name is required")
		.max(200, "Name must be less than 200 characters"),
	category: z.nativeEnum(ComplianceListItemCategory, {
		required_error: "Category is required",
	}),
	expirationType: z.nativeEnum(ComplianceListItemExpirationType, {
		required_error: "Expiration type is required",
	}),
	expirationRuleValue: z
		.number()
		.int()
		.min(1, "Must be at least 1")
		.optional()
		.nullable(),
	expirationRuleUnit: z.nativeEnum(ExpirationRuleUnit).optional().nullable(),
	issuerRequirement: z.boolean(),
	issuer: z.string().trim().optional().nullable(),
	responseStyle: z.nativeEnum(ComplianceListItemResponseStyle, {
		required_error: "Response style is required",
	}),
	file: z.string().trim().optional().nullable(),
	instructionalNotes: z.string().trim().optional().nullable(),
	displayToCandidate: z.boolean(),
	status: z.nativeEnum(ComplianceListItemStatus, {
		required_error: "Status is required",
	}),
});

export const ComplianceFormSchema = ComplianceFormBaseSchema.superRefine(
	(data, ctx) => {
		if (
			data.expirationType === ComplianceListItemExpirationType.EXPIRATION_RULE
		) {
			if (!data.expirationRuleValue) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["expirationRuleValue"],
					message: "Expiration rule value is required",
				});
			}
			if (!data.expirationRuleUnit) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["expirationRuleUnit"],
					message: "Expiration rule unit is required",
				});
			}
		}

		if (data.issuerRequirement && !data.issuer?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["issuer"],
				message: "Issuer type is required when issuer requirement is enabled",
			});
		}

		const requiresFile =
			data.responseStyle ===
				ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD ||
			data.responseStyle === ComplianceListItemResponseStyle.LINK;

		if (requiresFile && !data.file?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["file"],
				message:
					data.responseStyle === ComplianceListItemResponseStyle.LINK
						? "Link URL is required"
						: "Upload a file or provide a link URL",
			});
		}
	},
);

export type ComplianceFormValues = z.infer<typeof ComplianceFormSchema>;

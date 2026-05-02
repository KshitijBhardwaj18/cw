import { z } from "zod";

const SUBMISSION_TYPE_VALUES = [
	"VENDOR_AND_CANDIDATE",
	"VENDOR_ONLY",
	"CANDIDATE_ONLY",
] as const;

const VENDOR_ACCESS_VALUES = ["ALL_VENDORS", "SELECTED_VENDORS"] as const;

export const jobPostingSubmissionSchema = z
	.object({
		submissionType: z.enum(SUBMISSION_TYPE_VALUES, {
			required_error: "Submission type is required",
		}),
		vendorAccess: z.enum(VENDOR_ACCESS_VALUES, {
			required_error: "Vendor access is required",
		}),
		notesForVendors: z.string().max(2000).optional(),
		acceptanceCriteriaIds: z.array(z.string()),
		selectedVendorIds: z.array(z.string().uuid()).optional(),
	})
	.superRefine((value, ctx) => {
		if (value.vendorAccess !== "SELECTED_VENDORS") return;
		const ids = value.selectedVendorIds ?? [];
		if (ids.length === 0) {
			ctx.addIssue({
				code: "custom",
				message: "Select at least one vendor",
				path: ["selectedVendorIds"],
			});
		}
	});

export type JobPostingSubmissionValues = z.infer<
	typeof jobPostingSubmissionSchema
>;

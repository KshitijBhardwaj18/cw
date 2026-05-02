import { z } from "zod";

const PUBLISH_MODE_VALUES = [
	"SAVE_AS_DRAFT",
	"PUBLISH_IMMEDIATELY",
	"SCHEDULE_PUBLISH_DATE",
] as const;

export const jobPostingPublishSchema = z
	.object({
		publishMode: z.enum(PUBLISH_MODE_VALUES, {
			required_error: "Publish mode is required",
		}),
		scheduledPublishDate: z.string().optional(),
		scheduledPublishTime: z.string().optional(),
	})
	.superRefine((value, ctx) => {
		if (value.publishMode !== "SCHEDULE_PUBLISH_DATE") {
			return;
		}

		if (
			!value.scheduledPublishDate ||
			value.scheduledPublishDate.length === 0
		) {
			ctx.addIssue({
				code: "custom",
				message: "Publish date is required",
				path: ["scheduledPublishDate"],
			});
		}

		if (
			!value.scheduledPublishTime ||
			value.scheduledPublishTime.length === 0
		) {
			ctx.addIssue({
				code: "custom",
				message: "Publish time is required",
				path: ["scheduledPublishTime"],
			});
		}
	});

export type JobPostingPublishValues = z.infer<typeof jobPostingPublishSchema>;

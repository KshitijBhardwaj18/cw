import { z } from "zod";
import { todayIsoDate } from "./job-posting-details.schema";

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
		} else if (value.scheduledPublishDate < todayIsoDate()) {
			ctx.addIssue({
				code: "custom",
				message: "Publish date cannot be in the past",
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
		} else if (value.scheduledPublishDate === todayIsoDate()) {
			const now = new Date();
			const currentTime = now.toTimeString().slice(0, 5);
			if (value.scheduledPublishTime < currentTime) {
				ctx.addIssue({
					code: "custom",
					message: "Publish time must be in the future for today's date",
					path: ["scheduledPublishTime"],
				});
			}
		}
	});

export type JobPostingPublishValues = z.infer<typeof jobPostingPublishSchema>;

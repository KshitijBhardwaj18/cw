import { z } from "zod";

export const mspLinkOrgSchemaBase = z.object({
	organizationId: z.string().uuid("Please select an organization"),
	mspId: z.string().uuid("Invalid MSP ID"),
	addendumFileKey: z.string().min(1, "Addendum agreement file is required"),
	addendumFileName: z.string().min(1, "Addendum file name is required"),
	addendumRevisionDate: z.string().optional().nullable(),
	mspFeePercentage: z.coerce.number().min(0).max(100),
	saasFeePercentage: z.coerce.number().min(0).max(100),
	startDate: z.string().min(1, "Start date is required"),
	renewalDate: z.string().min(1, "Renewal date is required"),
	possibleCancellationDate: z.string().optional().nullable(),
});

export const mspLinkOrgSchema = mspLinkOrgSchemaBase.refine(
	(d) => new Date(d.renewalDate).getTime() > new Date(d.startDate).getTime(),
	{
		message: "Renewal date must be after start date",
		path: ["renewalDate"],
	},
);

export type MspLinkOrgPayload = z.infer<typeof mspLinkOrgSchema>;

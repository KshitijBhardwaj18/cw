import { z } from "zod";

export const mspLinkOrgSchema = z.object({
	organizationId: z.string().uuid("Please select an organization"),
	mspId: z.string().uuid("Invalid MSP ID"),
	addendumAgreement: z.string().min(1, "Addendum agreement name is required"),
	mspFeePercentage: z.coerce.number().min(0).max(100),
	saasFeePercentage: z.coerce.number().min(0).max(100),
	startDate: z.string().min(1, "Start date is required"),
	renewalDate: z.string().min(1, "Renewal date is required"),
	possibleCancellationDate: z.string().optional().nullable(),
});

export type MspLinkOrgPayload = z.infer<typeof mspLinkOrgSchema>;

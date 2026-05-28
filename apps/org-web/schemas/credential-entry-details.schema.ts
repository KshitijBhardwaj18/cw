import { z } from "zod";

export const credentialUploadDocumentFormSchema = z.object({
	itemId: z.string().trim().min(1, "Compliance item is required"),
	file: z.custom<File>(
		(value) => typeof File !== "undefined" && value instanceof File,
		"File upload is required",
	),
	expirationDate: z.string().trim().optional().default(""),
	issueDate: z.string().trim().optional().default(""),
});

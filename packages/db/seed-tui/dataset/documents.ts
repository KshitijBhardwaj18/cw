import { DocumentType } from "@repo/db";
import { getDeterministicId, SAMPLE_PDF_URL, SEED_PREFIX } from "../utils";

export const DOCUMENT_ID = {
	CONTRACT: getDeterministicId(`${SEED_PREFIX}doc-contract`),
	MARKETING: getDeterministicId(`${SEED_PREFIX}doc-marketing`),
	FINANCIAL: getDeterministicId(`${SEED_PREFIX}doc-financial`),
} as const;

export const getDocumentsDataset = (
	organizationId: string,
	authorIds: string[],
) => [
	{
		id: DOCUMENT_ID.CONTRACT,
		organizationId,
		name: "Contract_2023_Q4.pdf",
		type: DocumentType.LEGAL,
		description: "Quarterly sales contract for Q4 2023.",
		url: SAMPLE_PDF_URL,
		uploadedAt: new Date("2023-11-28"),
		uploadedBy: authorIds[0 % authorIds.length],
	},
	{
		id: DOCUMENT_ID.MARKETING,
		organizationId,
		name: "Marketing_Strategy.pdf",
		type: DocumentType.MARKETING,
		description: "Annual marketing strategy document.",
		url: SAMPLE_PDF_URL,
		uploadedAt: new Date("2023-11-27"),
		uploadedBy: authorIds[1 % authorIds.length],
	},
	{
		id: DOCUMENT_ID.FINANCIAL,
		organizationId,
		name: "Financial_Report.xlsx",
		type: DocumentType.FINANCE,
		description: "Monthly financial report for November.",
		url: SAMPLE_PDF_URL,
		uploadedAt: new Date("2023-11-26"),
		uploadedBy: authorIds[2 % authorIds.length],
	},
];

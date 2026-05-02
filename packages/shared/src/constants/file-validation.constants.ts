/**
 * System-wide file size limits (bytes).
 * - Images (logos, avatars): 2MB
 * - Documents (MSA, agreements, etc.): 10MB
 */
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const BULK_ENROLLMENT_FILE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const BULK_ENROLLMENT_FILE_MAX_MB = 5;

/** Candidate resume PDF uploads (aligned with server candidate onboarding limits) */
export const RESUME_MAX_SIZE_MB = 5;
export const RESUME_MAX_SIZE_BYTES = RESUME_MAX_SIZE_MB * 1024 * 1024;

/** HTML `accept` for resume PDF file inputs */
export const RESUME_FILE_ACCEPT = ".pdf,application/pdf";

/** Hint line for resume upload UI (matches {@link RESUME_MAX_SIZE_MB}) */
export const RESUME_UPLOAD_HINT = `PDF (Max ${RESUME_MAX_SIZE_MB}MB)`;

/** Allowed MIME type for bulk enrollment CSV uploads */
export const BULK_ENROLLMENT_CSV_MIME = "text/csv";

/** Value for HTML input accept attribute (bulk CSV uploads) */
export const BULK_CSV_ACCEPTED_TYPES = ".csv";

/** Allowed MIME types for logo/avatar images (PNG, JPEG) */
export const IMAGE_LOGO_MIMES = ["image/png", "image/jpeg"] as const;

/** Allowed MIME types for PDF-only documents (e.g. MSA) */
export const DOCUMENT_PDF_MIMES = ["application/pdf"] as const;

/** Allowed MIME types for contract documents (PDF, DOC, DOCX) */
export const CONTRACT_DOCUMENT_MIMES = [
	"application/pdf",
	"application/msword", // DOC
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
] as const;

export type ContractDocumentMime = (typeof CONTRACT_DOCUMENT_MIMES)[number];

/** Maps contract document MIME types to file extensions */
export const CONTRACT_DOCUMENT_MIME_TO_EXT: Record<
	ContractDocumentMime,
	string
> = {
	"application/pdf": "pdf",
	"application/msword": "doc",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		"docx",
};

/** Allowed MIME types for service agreements (PDF, CSV, Excel, PNG, JPEG) */
export const DOCUMENT_AGREEMENT_MIMES = [
	"application/pdf",
	"text/csv",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-excel",
	"image/png",
	"image/jpeg",
] as const;

/** Allowed MIME types for spreadsheet documents (.xlsx, .xls, .csv) */
export const SPREADSHEET_MIMES = [
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-excel",
	"text/csv",
] as const;

export type ImageLogoMime = (typeof IMAGE_LOGO_MIMES)[number];
export type DocumentAgreementMime = (typeof DOCUMENT_AGREEMENT_MIMES)[number];
export type SpreadsheetMime = (typeof SPREADSHEET_MIMES)[number];

/** Maps agreement document MIME types to file extensions */
export const AGREEMENT_MIME_TO_EXT: Record<DocumentAgreementMime, string> = {
	"application/pdf": "pdf",
	"text/csv": "csv",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	"application/vnd.ms-excel": "xls",
	"image/png": "png",
	"image/jpeg": "jpg",
};

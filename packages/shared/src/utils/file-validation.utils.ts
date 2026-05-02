import {
	AGREEMENT_MIME_TO_EXT,
	BULK_ENROLLMENT_CSV_MIME,
	BULK_ENROLLMENT_FILE_MAX_BYTES,
	CONTRACT_DOCUMENT_MIME_TO_EXT,
	CONTRACT_DOCUMENT_MIMES,
	DOCUMENT_AGREEMENT_MIMES,
	type DocumentAgreementMime,
	FILE_MAX_SIZE,
	IMAGE_LOGO_MIMES,
	IMAGE_MAX_SIZE,
	RESUME_MAX_SIZE_BYTES,
	RESUME_MAX_SIZE_MB,
	SPREADSHEET_MIMES,
} from "../constants/file-validation.constants";

/** File-like object (browser File has `type`/`name`, Express.Multer.File has `mimetype`/`originalname`) */
type FileLike = {
	size: number;
	type?: string;
	mimetype?: string;
	name?: string;
	originalname?: string;
};

function getMimetype(file: FileLike): string {
	return file.mimetype ?? file.type ?? "";
}

/**
 * Validates an image file (logo/avatar) against system-wide limits.
 * Returns error message or null if valid.
 */
export function validateImageFile(
	file: FileLike | undefined,
	fieldLabel = "Image",
): string | null {
	if (!file) return null;
	if (file.size > IMAGE_MAX_SIZE) {
		return `${fieldLabel} must be 2MB or less`;
	}
	const mimetype = getMimetype(file);
	if (
		!IMAGE_LOGO_MIMES.includes(mimetype as (typeof IMAGE_LOGO_MIMES)[number])
	) {
		return `${fieldLabel} must be PNG or JPEG`;
	}
	return null;
}

/**
 * Validates a candidate resume file (PDF, max {@link RESUME_MAX_SIZE_MB} MB).
 * Accepts PDF by MIME (`application/pdf`) or `.pdf` extension (covers empty browser `type`).
 * Returns error message or null if valid.
 */
export function validateResumePdf(
	file: FileLike | undefined,
	fieldLabel = "Resume",
): string | null {
	if (!file) return null;
	if (file.size > RESUME_MAX_SIZE_BYTES) {
		return `${fieldLabel} must be ${RESUME_MAX_SIZE_MB}MB or less`;
	}
	const mimetype = getMimetype(file);
	const basename = file.name ?? file.originalname ?? "";
	const ext = basename.split(".").pop()?.toLowerCase();
	const isPdf = mimetype === "application/pdf" || ext === "pdf";
	if (!isPdf) {
		return `${fieldLabel} must be PDF only`;
	}
	return null;
}

/**
 * Validates a PDF-only document against system-wide limits.
 * Returns error message or null if valid.
 */
export function validatePdfDocument(
	file: FileLike | undefined,
	fieldLabel = "Document",
): string | null {
	if (!file) return null;
	if (file.size > FILE_MAX_SIZE) {
		return `${fieldLabel} must be 10MB or less`;
	}
	if (getMimetype(file) !== "application/pdf") {
		return `${fieldLabel} must be PDF only`;
	}
	return null;
}

/**
 * Validates a contract document (PDF, DOC, DOCX) against system-wide limits.
 * Returns error message or null if valid.
 */
export function validateContractDocument(
	file: FileLike | undefined,
	fieldLabel = "Contract document",
): string | null {
	if (!file) return null;
	if (file.size > FILE_MAX_SIZE) {
		return `${fieldLabel} must be 10MB or less`;
	}
	const mimetype = getMimetype(file);
	if (
		!CONTRACT_DOCUMENT_MIMES.includes(
			mimetype as (typeof CONTRACT_DOCUMENT_MIMES)[number],
		)
	) {
		return `${fieldLabel} must be PDF, DOC, or DOCX`;
	}
	return null;
}

/**
 * Validates a document file (agreement, etc.) against system-wide limits.
 * Returns error message or null if valid.
 */
export function validateAgreementDocument(
	file: FileLike | undefined,
	fieldLabel = "Document",
): string | null {
	if (!file) return null;
	if (file.size > FILE_MAX_SIZE) {
		return `${fieldLabel} must be 10MB or less`;
	}
	const mimetype = getMimetype(file);
	if (!DOCUMENT_AGREEMENT_MIMES.includes(mimetype as DocumentAgreementMime)) {
		return `${fieldLabel} must be PDF, CSV, Excel, PNG, or JPEG`;
	}
	return null;
}

/**
 * Validates a spreadsheet document (Excel, CSV) against system-wide limits.
 * Returns error message or null if valid.
 */
export function validateSpreadsheetDocument(
	file: FileLike | undefined,
	fieldLabel = "Document",
): string | null {
	if (!file) return null;
	if (file.size > FILE_MAX_SIZE) {
		return `${fieldLabel} must be 10MB or less`;
	}
	const mimetype = getMimetype(file);
	if (
		!SPREADSHEET_MIMES.includes(mimetype as (typeof SPREADSHEET_MIMES)[number])
	) {
		return `${fieldLabel} must be Excel (.xlsx, .xls) or CSV`;
	}
	return null;
}

/**
 * Returns the file extension for an agreement document MIME type.
 */
export function getAgreementDocumentExtension(mimetype: string): string {
	return AGREEMENT_MIME_TO_EXT[mimetype as DocumentAgreementMime] ?? "bin";
}

/**
 * Returns the file extension for a contract document MIME type.
 */
export function getContractDocumentExtension(mimetype: string): string {
	return (
		(CONTRACT_DOCUMENT_MIME_TO_EXT as Record<string, string>)[mimetype] ?? "bin"
	);
}

/**
 * Validates a bulk enrollment CSV file (size and type).
 * Returns error message or null if valid.
 */
export function validateBulkEnrollmentCsv(
	file: FileLike | undefined,
	fieldLabel = "File",
): string | null {
	if (!file) return null;
	if (file.size > BULK_ENROLLMENT_FILE_MAX_BYTES) {
		return `${fieldLabel} must be ${BULK_ENROLLMENT_FILE_MAX_BYTES / (1024 * 1024)}MB or less`;
	}
	const mimetype = getMimetype(file);
	const ext = file.originalname?.split(".").pop()?.toLowerCase();
	const isCsv = mimetype === BULK_ENROLLMENT_CSV_MIME || ext === "csv";
	if (!isCsv) {
		return "Only CSV files are supported";
	}
	return null;
}

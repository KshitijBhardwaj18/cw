/**
 * S3 object key prefixes for the shared app bucket (`AWS_S3_BUCKET`).
 * Bucket name/region stay in env config; these are logical path namespaces only.
 */

export const S3_PREFIX_BULK_ENROLLMENT = "bulk-enrollment";
export const S3_PREFIX_BULK_PLATFORM_USERS = "bulk-platform-users";

/** Compliance wallet / placement compliance files (tree under this prefix). */
export const S3_PREFIX_COMPLIANCE_DOCS = "compliance-docs";

/** Top-level `organizations/` segment for composed keys. */
export const S3_PREFIX_ORGANIZATIONS = "organizations";

/** `organizations/{orgId}/vendor-contracts/...` */
export const S3_SEGMENT_ORGANIZATION_VENDOR_CONTRACTS = "vendor-contracts";

/** Public CDN-style paths (upload with `public: true` where applicable). */
export const S3_PREFIX_PUBLIC_ORGANIZATION_LOGOS = "public/organizations/logos";
export const S3_PREFIX_PUBLIC_ORGANIZATION_AGREEMENTS =
	"public/organizations/agreements";
export const S3_PREFIX_PUBLIC_ORGANIZATION_LOCATIONS =
	"public/organizations/locations";
export const S3_PREFIX_PUBLIC_VENDOR_LOGOS = "public/vendors/logos";

/** MSP / org PDF uploads: `organizations/docs/{folder}/...` */
export const S3_PREFIX_ORGANIZATION_DOCS = "organizations/docs";

/** Vendor & org document modules (`documents.service`). */
export const S3_PREFIX_VENDOR_DOCUMENTS = "vendors/documents";
export const S3_PREFIX_ORGANIZATION_DOCUMENTS = "organizations/documents";

/** Compliance checklist list item file uploads (distinct from `S3_PREFIX_COMPLIANCE_DOCS`). */
export const S3_PREFIX_COMPLIANCE_LIST_DOCUMENTS = "compliance/docs";

export const S3_PREFIX_CANDIDATE_RESUMES = "candidates/resumes";

export const S3_PREFIX_CANDIDATE_SKILLS_CHECKLISTS =
	"candidates/skills-checklists";

export const S3_PREFIX_TIMEKEEPING_UPLOADS = "timekeeping/uploads";

/** Dispute supporting docs: `billing/disputes/{orgId}/{userId}/{file}` */
export const S3_PREFIX_BILLING_DISPUTE_DOCUMENTS = "billing/disputes";

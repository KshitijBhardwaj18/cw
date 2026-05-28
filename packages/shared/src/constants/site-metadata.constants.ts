/** Product name used in HTML document titles. */
export const STAFF_LOGIC_BRAND_NAME = "Staff Logic";

export const ADMIN_PORTAL_DISPLAY_NAME = "Admin Portal";

export const ORGANIZATION_PORTAL_DISPLAY_NAME = "Organization Portal";

export const CANDIDATE_PORTAL_DISPLAY_NAME = "Candidate Portal";

export const VENDOR_PORTAL_DISPLAY_NAME = "Vendor Portal";

/**
 * Full HTML title: `Page | Portal | Staff Logic`
 */
export function formatStaffLogicDocumentTitle(
	pageName: string,
	portalDisplayName: string,
): string {
	return `${pageName} • ${portalDisplayName} • ${STAFF_LOGIC_BRAND_NAME}`;
}

/**
 * Next.js `metadata.title.template`: `%s | Portal | Staff Logic`.
 * Child routes should set `metadata.title` to the page name string only.
 */
export function staffLogicDocumentTitleTemplate(
	portalDisplayName: string,
): string {
	return `%s • ${portalDisplayName} • ${STAFF_LOGIC_BRAND_NAME}`;
}

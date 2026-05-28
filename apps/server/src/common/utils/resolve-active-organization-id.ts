import type { PrismaClient } from "@repo/db";
import { resolveRequestedOrgSlug } from "./resolve-requested-org-slug";

type HeadersLike =
	| Headers
	| Record<string, string | string[] | undefined>
	| undefined;

function normalizeHeaders(
	headers: HeadersLike,
): Record<string, string | string[] | undefined> | undefined {
	if (!headers) return undefined;
	if (typeof Headers !== "undefined" && headers instanceof Headers) {
		const out: Record<string, string> = {};
		headers.forEach((value, key) => {
			out[key.toLowerCase()] = value;
		});
		return out;
	}
	return headers as Record<string, string | string[] | undefined>;
}

export async function resolveActiveOrganizationIdFromRequest(
	prisma: Pick<PrismaClient, "organization">,
	headers: HeadersLike,
): Promise<string | null> {
	try {
		const normalized = normalizeHeaders(headers);
		const slug = resolveRequestedOrgSlug(normalized);
		if (!slug) return null;
		const org = await prisma.organization.findUnique({
			where: { slug },
			select: { id: true },
		});
		return org?.id ?? null;
	} catch {
		return null;
	}
}

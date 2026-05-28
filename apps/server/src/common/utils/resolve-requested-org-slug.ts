import { AUTH_ORG_SLUG_HEADER } from "@repo/shared";
import { config } from "../config";

const SYSTEM_SUBDOMAINS = new Set([
	"www",
	"mail",
	"ftp",
	"smtp",
	"api",
	"admin",
]);

function headerValue(
	headers: Record<string, string | string[] | undefined> | undefined,
	name: string,
): string | null {
	const raw = headers?.[name];
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function rootDomainHostname(): string {
	try {
		return new URL(config.urls.orgPortalBaseUrl).hostname.split(":")[0] ?? "";
	} catch {
		return "";
	}
}

function extractSlugFromHostname(hostname: string): string | null {
	if (!hostname) return null;
	const host = hostname.split(":")[0] ?? "";
	const root = rootDomainHostname();
	if (!root) return null;
	const hostParts = host.split(".");
	const rootParts = root.split(".");
	if (hostParts.length <= rootParts.length) return null;
	const slug = hostParts
		.slice(0, hostParts.length - rootParts.length)
		.join(".");
	const lower = slug.toLowerCase();
	if (!lower || SYSTEM_SUBDOMAINS.has(lower)) return null;
	return lower;
}

function slugFromUrlHeader(value: string | null): string | null {
	if (!value) return null;
	try {
		const u = new URL(value);
		return extractSlugFromHostname(u.hostname);
	} catch {
		return null;
	}
}

export function resolveRequestedOrgSlug(
	headers: Record<string, string | string[] | undefined> | undefined,
): string | null {
	const explicit = headerValue(headers, AUTH_ORG_SLUG_HEADER);
	if (explicit) return explicit.toLowerCase();
	const fromOrigin = slugFromUrlHeader(headerValue(headers, "origin"));
	if (fromOrigin) return fromOrigin;
	const fromReferer = slugFromUrlHeader(headerValue(headers, "referer"));
	if (fromReferer) return fromReferer;
	const fromHost = extractSlugFromHostname(
		headerValue(headers, "x-forwarded-host") ??
			headerValue(headers, "host") ??
			"",
	);
	if (fromHost) return fromHost;
	return null;
}

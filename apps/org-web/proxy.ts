import { AUTH_PORTAL_HEADER, AUTH_PORTAL_ORG } from "@repo/shared";
import { type NextRequest, NextResponse } from "next/server";
import { envConfig } from "@/config";

const SYSTEM_SUBDOMAINS = new Set(["www", "mail", "ftp", "smtp"]);

function extractSlug(host: string): string | null {
	const hostname = host.split(":")[0];
	const domainHostname = envConfig.appDomain.split(":")[0];
	const domainParts = domainHostname.split(".");
	const hostParts = hostname.split(".");

	if (hostParts.length <= domainParts.length) return null;

	return hostParts.slice(0, hostParts.length - domainParts.length).join(".");
}

type PublicOrgResponse = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	timeZone: string;
	industry: string;
};

export async function proxy(request: NextRequest) {
	const host = request.headers.get("host") ?? "";
	const rawSlug = extractSlug(host);

	if (!rawSlug || SYSTEM_SUBDOMAINS.has(rawSlug)) {
		return NextResponse.redirect(envConfig.landingUrl);
	}

	const slug = rawSlug.toLowerCase();

	try {
		const res = await fetch(
			`${envConfig.apiUrl}/api/organizations/public/slug/${slug}`,
			{
				cache: "no-store",
				headers: { [AUTH_PORTAL_HEADER]: AUTH_PORTAL_ORG },
			},
		);

		if (!res.ok) {
			return NextResponse.rewrite(new URL("/org-not-found", request.url));
		}

		const org = (await res.json()) as PublicOrgResponse;

		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-org-id", org.id);
		requestHeaders.set("x-org-slug", org.slug);
		requestHeaders.set("x-org-name", org.name);
		requestHeaders.set("x-org-timezone", org.timeZone);
		requestHeaders.set("x-org-industry", org.industry);
		if (org.logo) {
			requestHeaders.set("x-org-logo", org.logo);
		}

		const pathname = new URL(request.url).pathname;
		if (pathname === "/") {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		return NextResponse.next({ request: { headers: requestHeaders } });
	} catch {
		return NextResponse.rewrite(new URL("/org-not-found", request.url));
	}
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|org-not-found|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};

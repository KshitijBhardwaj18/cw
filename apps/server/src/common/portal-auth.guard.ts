import {
	BadRequestException,
	type CanActivate,
	type ExecutionContext,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
	AUTH_PORTAL_ADMIN,
	AUTH_PORTAL_HEADER,
	AUTH_PORTAL_ORG,
} from "@repo/shared";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { authAdmin, authOrg } from "./auth";

const ADMIN_COOKIE_BASE = "admin.session_token";
const ORG_COOKIE_BASE = "org.session_token";

function hasSessionCookie(cookieHeader: string | undefined, base: string) {
	if (!cookieHeader) return false;
	const escaped = base.replace(/\./g, "\\.");
	const pattern = new RegExp(`(?:^|;\\s*)(?:__Secure-)?${escaped}=`);
	return pattern.test(cookieHeader);
}

@Injectable()
export class PortalAuthGuard implements CanActivate {
	private readonly adminGuard: AuthGuard;
	private readonly orgGuard: AuthGuard;

	constructor(reflector: Reflector) {
		this.adminGuard = new AuthGuard(reflector, { auth: authAdmin });
		this.orgGuard = new AuthGuard(reflector, { auth: authOrg });
	}

	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<{
			headers: Record<string, string | string[] | undefined>;
		}>();

		const cookieHeader = Array.isArray(request.headers.cookie)
			? request.headers.cookie[0]
			: request.headers.cookie;
		const hasAdmin = hasSessionCookie(cookieHeader, ADMIN_COOKIE_BASE);
		const hasOrg = hasSessionCookie(cookieHeader, ORG_COOKIE_BASE);

		if (hasAdmin && !hasOrg) return this.adminGuard.canActivate(context);
		if (hasOrg && !hasAdmin) return this.orgGuard.canActivate(context);

		const rawHint = request.headers[AUTH_PORTAL_HEADER];
		const rawValue = Array.isArray(rawHint) ? rawHint[0] : rawHint;
		const portalHint =
			typeof rawValue === "string" ? rawValue.trim().toLowerCase() : "";

		if (hasAdmin && hasOrg) {
			if (portalHint === AUTH_PORTAL_ADMIN) {
				return this.adminGuard.canActivate(context);
			}
			if (portalHint === AUTH_PORTAL_ORG) {
				return this.orgGuard.canActivate(context);
			}
			throw new BadRequestException({
				message: `Both admin and org session cookies are present. Set ${AUTH_PORTAL_HEADER} to "${AUTH_PORTAL_ADMIN}" or "${AUTH_PORTAL_ORG}".`,
				code: "AUTH_PORTAL_AMBIGUOUS",
			});
		}

		if (portalHint === AUTH_PORTAL_ADMIN) {
			return this.adminGuard.canActivate(context);
		}
		if (portalHint === AUTH_PORTAL_ORG || portalHint === "") {
			return this.orgGuard.canActivate(context);
		}
		throw new BadRequestException({
			message: `Invalid ${AUTH_PORTAL_HEADER}. Use "${AUTH_PORTAL_ADMIN}" or "${AUTH_PORTAL_ORG}".`,
			code: "AUTH_PORTAL_HEADER_INVALID",
		});
	}
}

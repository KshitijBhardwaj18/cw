import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { AUTH_TENANT_MISMATCH_CODE } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import { resolveRequestedOrgSlug } from "./utils/resolve-requested-org-slug";

const TENANT_AFFINITY_SKIP_PATHS: ReadonlyArray<RegExp> = [
	/^\/api\/auth\//,
	/^\/api\/organizations\/public\//,
	/^\/api\/organizations\/me-orgs$/,
];

@Injectable()
export class TenantAffinityGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<{
			url?: string;
			path?: string;
			headers: Record<string, string | string[] | undefined>;
			session?: {
				session?: { activeOrganizationId?: string | null };
				activeOrganizationId?: string | null;
			};
		}>();

		const path = request.path ?? request.url ?? "";
		if (TENANT_AFFINITY_SKIP_PATHS.some((re) => re.test(path))) {
			return true;
		}

		const session = request.session;
		const activeOrganizationId =
			session?.session?.activeOrganizationId ??
			session?.activeOrganizationId ??
			null;
		if (!activeOrganizationId) {
			return true;
		}

		const requestedSlug = resolveRequestedOrgSlug(request.headers);
		if (!requestedSlug) {
			return true;
		}

		const requestedOrg = await this.prisma.organization.findUnique({
			where: { slug: requestedSlug },
			select: { id: true },
		});
		if (!requestedOrg) {
			throw new ForbiddenException({
				message: "This hostname is not associated with any organization.",
				code: AUTH_TENANT_MISMATCH_CODE,
			});
		}
		if (requestedOrg.id !== activeOrganizationId) {
			throw new ForbiddenException({
				message:
					"Your session belongs to a different organization. Sign in again to access this one.",
				code: AUTH_TENANT_MISMATCH_CODE,
			});
		}
		return true;
	}
}

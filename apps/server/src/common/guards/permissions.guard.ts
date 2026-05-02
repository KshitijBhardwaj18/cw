import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { defineAbility } from "@repo/casl";
import { type User, UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { AuthUser } from "../auth";
import {
	PERMISSIONS,
	type RequiredAbility,
} from "../decorators/permissions.decorator";

type AbilityUser = User & { subRole: string | null };

function resolveAbilityUser(session: UserSession): AbilityUser {
	const user = session.user as User & { subRole?: string | null };
	const role = user.role as UserRole | undefined;
	const orgId = session.session?.activeOrganizationId?.trim();
	let subRole: string | null = null;

	if (!role) {
		throw new ForbiddenException("User not authenticated");
	}
	switch (role) {
		case UserRole.ORGANIZATION_USER:
		case UserRole.CANDIDATE_USER:
		case UserRole.VENDOR_USER:
			if (!orgId) {
				throw new ForbiddenException("No active organization in session");
			}
			subRole = user.subRole ?? null;
			break;
		case UserRole.OPERATIONS_MANAGER:
		case UserRole.PROGRAM_MANAGER:
		case UserRole.TECHNICAL_MANAGER:
		case UserRole.PROGRAM_VENDOR_MANAGER:
		case UserRole.COMPLIANCE_MANAGER:
			if (orgId) {
				subRole = user.subRole ?? null;
			}
			break;
		default:
			subRole = null;
	}

	return {
		...user,
		subRole: subRole,
	};
}

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		@Inject(Reflector)
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredAbilities = this.reflector.getAllAndOverride<
			RequiredAbility[]
		>(PERMISSIONS, [context.getHandler(), context.getClass()]);

		if (!requiredAbilities || requiredAbilities.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user: AuthUser = request.user;
		const session = request.session as UserSession | undefined;
		if (!user || !session) {
			throw new ForbiddenException("User not authenticated");
		}
		const abilityUser = resolveAbilityUser(session);
		const ability = defineAbility(abilityUser);
		request.ability = ability;

		for (const required of requiredAbilities) {
			if (!ability.can(required.action, required.subject)) {
				throw new ForbiddenException(
					`You cannot ${required.action} ${required.subject}`,
				);
			}
		}

		return true;
	}
}

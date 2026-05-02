import { BadRequestException } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";

export function requireActiveOrganizationId(session: UserSession): string {
	const id = session.session.activeOrganizationId?.trim();
	if (!id) {
		throw new BadRequestException("No active organization in session");
	}
	return id;
}

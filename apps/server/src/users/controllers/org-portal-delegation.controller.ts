import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import {
	CreateOrgPortalDelegationDto,
	OrgPortalDelegationResponseDto,
} from "../dto/org-portal-delegation.dto";
import { OrgPortalDelegationService } from "../services/org-portal-delegation.service";

@ApiTags("users")
@Controller("users")
export class OrgPortalDelegationController {
	constructor(private readonly service: OrgPortalDelegationService) {}

	@Post("me/org-portal-delegate")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			"Issue a single-use delegation URL so a platform admin can enter an organization's portal.",
	})
	async createDelegation(
		@Session() session: UserSession,
		@Body() dto: CreateOrgPortalDelegationDto,
	): Promise<OrgPortalDelegationResponseDto> {
		return this.service.createDelegationLink(session, dto.organizationId);
	}
}

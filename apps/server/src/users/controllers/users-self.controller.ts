import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { SetActiveOrganizationDto } from "../dto/set-active-organization.dto";
import { UsersService } from "../services/users.service";

@ApiTags("users")
@Controller("users")
export class UsersSelfController {
	constructor(private readonly usersService: UsersService) {}

	@Post("me/active-organization")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Set active organization (platform admins)" })
	async setActiveOrganization(
		@Session() session: UserSession,
		@Body() dto: SetActiveOrganizationDto,
	): Promise<void> {
		await this.usersService.setActiveOrganizationForAdmin(
			session,
			dto.organizationId,
		);
	}
}

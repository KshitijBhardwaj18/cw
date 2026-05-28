import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CandidatesAccountService } from "../services/candidates-account.service";

@ApiTags("candidates / account")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatesAccountController {
	constructor(
		private readonly candidatesAccountService: CandidatesAccountService,
	) {}

	@Post("me/close-account")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@ApiOperation({
		summary:
			"Close the current candidate account. Hides profile, withdraws active submissions, clears vendor-review intents, revokes sessions. Retains historical records (placements, billing, audit).",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404, description: "Candidate profile not found" })
	async closeAccount(@Session() session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		const result = await this.candidatesAccountService.closeAccount(
			session.user.id,
			organizationId,
		);
		return { closedAt: result.closedAt.toISOString() };
	}
}

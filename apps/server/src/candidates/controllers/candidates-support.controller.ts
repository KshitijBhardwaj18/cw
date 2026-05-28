import {
	Body,
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
import { CandidateSupportRequestDto } from "../dto/candidate-support-request.dto";
import { CandidatesSupportService } from "../services/candidates-support.service";

@ApiTags("candidates / support")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatesSupportController {
	constructor(
		private readonly candidatesSupportService: CandidatesSupportService,
	) {}

	@Post("me/support-request")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@ApiOperation({
		summary:
			"Submit a support request from the candidate portal. Emails the org administrators with the candidate's question.",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({
		status: 404,
		description: "Candidate or organization missing",
	})
	async submitSupportRequest(
		@Session() session: UserSession,
		@Body() body: CandidateSupportRequestDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		const result = await this.candidatesSupportService.submitSupportRequest(
			session.user.id,
			organizationId,
			body,
		);
		return result;
	}
}

import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import type { MatchingCriterionWithLogicDto } from "./dto/matching-criterion-with-logic.dto";
import { SaveMatchingLogicDto } from "./dto/save-matching-logic.dto";
import { MatchingLogicService } from "./matchinglogic.service";

@Controller()
@ApiTags("Matching Logic")
@UseGuards(PermissionsGuard)
export class MatchingLogicController {
	constructor(private readonly matchingLogicService: MatchingLogicService) {}

	@Get("org/matching-logic")
	@ApiOperation({
		summary: "Get matching criteria with org-specific logic",
		description:
			"Returns all matching criteria. When no MatchingLogic exists for the org, returns active=false and weight=0 (empty state).",
	})
	@ApiResponse({
		status: 200,
		description:
			"List of matching criteria with their org-specific active/weight",
	})
	@Permissions({ action: Action.List, subject: "MatchingLogic" })
	async getMatchingLogic(
		@Session() session: UserSession,
	): Promise<MatchingCriterionWithLogicDto[]> {
		const organizationId = requireActiveOrganizationId(session);
		return this.matchingLogicService.findMatchingLogicsForOrg(organizationId);
	}

	@Get("organizations/:id/matching-logic")
	@ApiOperation({
		summary:
			"Get matching criteria for an organization (explicit id, e.g. admin)",
	})
	@ApiResponse({
		status: 200,
		description:
			"List of matching criteria with their org-specific active/weight",
	})
	@Permissions({ action: Action.List, subject: "MatchingLogic" })
	async getMatchingLogicForOrganization(
		@Param("id", ParseUUIDPipe) organizationId: string,
	): Promise<MatchingCriterionWithLogicDto[]> {
		return this.matchingLogicService.findMatchingLogicsForOrg(organizationId);
	}

	@Post("org/matching-logic")
	@ApiOperation({
		summary: "Save matching logic for organization",
		description:
			"Creates or updates MatchingLogic records for all criteria. Use when user toggles/weights and clicks Save.",
	})
	@ApiResponse({
		status: 201,
		description: "Saved matching logic; returns updated list",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Manage, subject: "MatchingLogic" })
	async saveMatchingLogic(
		@Session() session: UserSession,
		@Body() dto: SaveMatchingLogicDto,
	): Promise<MatchingCriterionWithLogicDto[]> {
		const organizationId = requireActiveOrganizationId(session);
		const userId = session?.user?.id;
		return this.matchingLogicService.saveMatchingLogicForOrg(
			organizationId,
			dto,
			userId,
		);
	}

	@Post("organizations/:id/matching-logic")
	@ApiOperation({
		summary:
			"Save matching logic for an organization (explicit id, e.g. admin)",
	})
	@ApiResponse({
		status: 201,
		description: "Saved matching logic; returns updated list",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Manage, subject: "MatchingLogic" })
	async saveMatchingLogicForOrganization(
		@Param("id", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@Body() dto: SaveMatchingLogicDto,
	): Promise<MatchingCriterionWithLogicDto[]> {
		const userId = session?.user?.id;
		return this.matchingLogicService.saveMatchingLogicForOrg(
			organizationId,
			dto,
			userId,
		);
	}
}

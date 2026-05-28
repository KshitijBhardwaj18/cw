import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseEnumPipe,
	ParseUUIDPipe,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { AgingRuleStageTransition } from "@repo/db";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { AgingRulesResponseDto } from "../dto/aging-rule.response.dto";
import { UpsertAgingRulesDto } from "../dto/upsert-aging-rules.dto";
import { AgingRulesService } from "../services/aging-rules.service";

@ApiTags("aging-rules")
@Controller(":organizationId/aging-rules")
@UseGuards(PermissionsGuard)
export class AgingRulesController {
	constructor(private readonly service: AgingRulesService) {}

	@Get()
	@ApiOperation({ summary: "List aging rules for an organization" })
	@ApiResponse({
		status: 200,
		type: AgingRulesResponseDto,
		description: "Rules with applied defaults",
	})
	@Permissions({ action: Action.List, subject: "AgingRule" })
	async list(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	): Promise<AgingRulesResponseDto> {
		const rules = await this.service.list(organizationId);
		return { rules };
	}

	@Put()
	@ApiOperation({ summary: "Upsert aging rules for an organization" })
	@ApiResponse({
		status: 200,
		type: AgingRulesResponseDto,
		description: "Updated rules",
	})
	@Permissions({ action: Action.Update, subject: "AgingRule" })
	async upsert(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: UpsertAgingRulesDto,
	): Promise<AgingRulesResponseDto> {
		const rules = await this.service.upsertMany(organizationId, dto);
		return { rules };
	}

	@Delete(":stageTransition")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: "Delete a single aging rule (reverts to unconfigured default)",
	})
	@ApiResponse({ status: 204, description: "Rule removed" })
	@Permissions({ action: Action.Update, subject: "AgingRule" })
	async deleteOne(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("stageTransition", new ParseEnumPipe(AgingRuleStageTransition))
		stageTransition: AgingRuleStageTransition,
	): Promise<void> {
		await this.service.deleteOne(organizationId, stageTransition);
	}
}

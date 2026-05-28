import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequisitionAttentionRulesResponseDto } from "../dto/requisition-attention-rule.response.dto";
import { UpsertRequisitionAttentionRulesDto } from "../dto/upsert-requisition-attention-rules.dto";
import { RequisitionAttentionRulesService } from "../services/requisition-attention-rules.service";

@ApiTags("requisition-attention-rules")
@Controller(":organizationId/requisition-attention-rules")
@UseGuards(PermissionsGuard)
export class RequisitionAttentionRulesController {
	constructor(private readonly service: RequisitionAttentionRulesService) {}

	@Get()
	@ApiOperation({
		summary: "List requisition attention rules for an organization",
	})
	@ApiResponse({
		status: 200,
		type: RequisitionAttentionRulesResponseDto,
		description: "Rules with applied defaults",
	})
	@Permissions({ action: Action.List, subject: "RequisitionAttentionRule" })
	async list(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	): Promise<RequisitionAttentionRulesResponseDto> {
		const rules = await this.service.list(organizationId);
		return { rules };
	}

	@Put()
	@ApiOperation({
		summary: "Upsert requisition attention rules for an organization",
	})
	@ApiResponse({
		status: 200,
		type: RequisitionAttentionRulesResponseDto,
		description: "Updated rules",
	})
	@Permissions({ action: Action.Update, subject: "RequisitionAttentionRule" })
	async upsert(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: UpsertRequisitionAttentionRulesDto,
	): Promise<RequisitionAttentionRulesResponseDto> {
		const rules = await this.service.upsertMany(organizationId, dto);
		return { rules };
	}
}

import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateTaggingRuleDto } from "./dto/create-tagging-rule.dto";
import { UpdateTaggingRuleDto } from "./dto/update-tagging-rule.dto";
import { TaggingRulesService } from "./tagging-rules.service";

@ApiTags("tagging-rules")
@Controller(":organizationId/tagging-rules")
@UseGuards(PermissionsGuard)
export class TaggingRulesController {
	constructor(private readonly taggingRulesService: TaggingRulesService) {}

	@Get()
	@ApiOperation({ summary: "List tagging rules for an organization" })
	@ApiResponse({ status: 200, description: "Tagging rules with stats" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "TaggingRule" })
	async getTaggingRules(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.taggingRulesService.findTaggingRulesByOrganization(
			organizationId,
		);
	}

	@Get("tags")
	@ApiOperation({ summary: "List tags with rule counts for organization" })
	@ApiResponse({ status: 200, description: "Tags with rule counts" })
	@Permissions({ action: Action.List, subject: "Tag" })
	async getTagsWithRuleCounts(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.taggingRulesService.getTagsWithRuleCounts(organizationId);
	}

	@Get("questions")
	@ApiOperation({
		summary: "Get questions for questionnaire (occupation or specialty)",
	})
	@ApiResponse({ status: 200, description: "Questions list" })
	@Permissions({ action: Action.List, subject: "TaggingRuleQuestion" })
	async getQuestions(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query("sourceType") sourceType: "OCCUPATION" | "SPECIALTY",
		@Query("organizationOccupationId") organizationOccupationId?: string,
		@Query("organizationSpecialtyId") organizationSpecialtyId?: string,
	) {
		return this.taggingRulesService.getQuestionsForQuestionnaire(
			organizationId,
			sourceType,
			organizationOccupationId,
			organizationSpecialtyId,
		);
	}

	@Get("tags-list")
	@ApiOperation({ summary: "Get all tags for dropdown" })
	@ApiResponse({ status: 200, description: "Tags list" })
	@Permissions({ action: Action.List, subject: "Tag" })
	async getTags(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.taggingRulesService.getTagsForOrg(organizationId);
	}

	@Get(":taggingRuleId")
	@ApiOperation({ summary: "Get a tagging rule by ID" })
	@ApiResponse({ status: 200, description: "Tagging rule details" })
	@ApiResponse({ status: 404, description: "Tagging rule not found" })
	@Permissions({ action: Action.Read, subject: "TaggingRule" })
	async getTaggingRule(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("taggingRuleId", ParseUUIDPipe) taggingRuleId: string,
	) {
		return this.taggingRulesService.findOne(organizationId, taggingRuleId);
	}

	@Post()
	@ApiOperation({ summary: "Create a tagging rule" })
	@ApiResponse({ status: 201, description: "Tagging rule created" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or resource not found",
	})
	@Permissions({ action: Action.Create, subject: "TaggingRule" })
	async createTaggingRule(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: CreateTaggingRuleDto,
		@Session() session: UserSession,
	) {
		return this.taggingRulesService.create(
			organizationId,
			dto,
			session.user.id,
		);
	}

	@Put(":taggingRuleId")
	@ApiOperation({ summary: "Update a tagging rule" })
	@ApiResponse({ status: 200, description: "Tagging rule updated" })
	@ApiResponse({ status: 404, description: "Tagging rule not found" })
	@Permissions({ action: Action.Update, subject: "TaggingRule" })
	async updateTaggingRule(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("taggingRuleId", ParseUUIDPipe) taggingRuleId: string,
		@Body() dto: UpdateTaggingRuleDto,
		@Session() session: UserSession,
	) {
		return this.taggingRulesService.update(
			organizationId,
			taggingRuleId,
			dto,
			session.user.id,
		);
	}

	@Delete(":taggingRuleId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a tagging rule" })
	@ApiResponse({ status: 204, description: "Tagging rule deleted" })
	@ApiResponse({ status: 404, description: "Tagging rule not found" })
	@Permissions({ action: Action.Delete, subject: "TaggingRule" })
	async deleteTaggingRule(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("taggingRuleId", ParseUUIDPipe) taggingRuleId: string,
	): Promise<void> {
		return this.taggingRulesService.delete(organizationId, taggingRuleId);
	}
}

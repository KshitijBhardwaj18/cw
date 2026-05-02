import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { ReorderSubmissionReadinessDto } from "./dto/reorder-submission-readiness.dto";
import { ToggleActiveDto } from "./dto/toggle-active.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { QuestionnaireService } from "./questionnaire.service";

@Controller("questionnaires")
@ApiTags("Questionnaires")
@UseGuards(PermissionsGuard)
export class QuestionnaireController {
	constructor(private readonly questionnaireService: QuestionnaireService) {}

	@Get("org/:organizationId/occupation/:orgOccupationId/questionnaire")
	@ApiOperation({ summary: "Get or create occupation questionnaire" })
	@ApiResponse({ status: 200, description: "Questionnaire details" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or occupation not found",
	})
	@Permissions({ action: Action.Read, subject: "Questionnaire" })
	async getOccupationQuestionnaire(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("orgOccupationId", ParseUUIDPipe) orgOccupationId: string,
	) {
		return this.questionnaireService.getOrCreateQuestionnaire(
			organizationId,
			orgOccupationId,
			undefined,
		);
	}

	@Get("org/:organizationId/specialty/:orgSpecialtyId/questionnaire")
	@ApiOperation({ summary: "Get or create specialty questionnaire" })
	@ApiResponse({ status: 200, description: "Questionnaire details" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or specialty not found",
	})
	@Permissions({ action: Action.Read, subject: "Questionnaire" })
	async getSpecialtyQuestionnaire(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("orgSpecialtyId", ParseUUIDPipe) orgSpecialtyId: string,
	) {
		return this.questionnaireService.getOrCreateQuestionnaire(
			organizationId,
			undefined,
			orgSpecialtyId,
		);
	}

	@Patch("org/:organizationId/questionnaire/:id/active")
	@ApiOperation({ summary: "Toggle questionnaire active state" })
	@ApiResponse({ status: 200, description: "Active state updated" })
	@ApiResponse({ status: 404, description: "Questionnaire not found" })
	@Permissions({ action: Action.Update, subject: "Questionnaire" })
	async toggleActive(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: ToggleActiveDto,
	) {
		await this.questionnaireService.toggleActive(
			id,
			dto.active,
			organizationId,
		);
		return { active: dto.active };
	}

	@Post("org/:organizationId/questionnaire/:id/questions")
	@ApiOperation({ summary: "Create a question on a questionnaire" })
	@ApiResponse({ status: 201, description: "Question created" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Questionnaire not found" })
	@Permissions({ action: Action.Create, subject: "Question" })
	async createQuestion(
		@Param("organizationId", ParseUUIDPipe) _organizationId: string,
		@Param("id", ParseUUIDPipe) questionnaireId: string,
		@Body() dto: CreateQuestionDto,
		@Session() session: UserSession,
	) {
		return this.questionnaireService.createQuestion(
			questionnaireId,
			dto,
			session.user.id,
		);
	}

	@Patch("org/:organizationId/questionnaire/:id/questions/:questionId")
	@ApiOperation({ summary: "Update a question" })
	@ApiResponse({ status: 200, description: "Question updated" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Questionnaire or question not found",
	})
	@Permissions({ action: Action.Update, subject: "Question" })
	async updateQuestion(
		@Param("organizationId", ParseUUIDPipe) _organizationId: string,
		@Param("id", ParseUUIDPipe) questionnaireId: string,
		@Param("questionId", ParseUUIDPipe) questionId: string,
		@Body() dto: UpdateQuestionDto,
		@Session() session: UserSession,
	) {
		return this.questionnaireService.updateQuestion(
			questionnaireId,
			questionId,
			dto,
			session.user.id,
		);
	}

	@Delete("org/:organizationId/questionnaire/:id/questions/:questionId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a question" })
	@ApiResponse({ status: 204, description: "Question deleted" })
	@ApiResponse({
		status: 404,
		description: "Questionnaire or question not found",
	})
	@Permissions({ action: Action.Delete, subject: "Question" })
	async deleteQuestion(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("id", ParseUUIDPipe) questionnaireId: string,
		@Param("questionId", ParseUUIDPipe) questionId: string,
	): Promise<void> {
		await this.questionnaireService.deleteQuestion(
			questionnaireId,
			questionId,
			organizationId,
		);
	}

	@Patch("org/:organizationId/questionnaire/:id/submission-readiness-order")
	@ApiOperation({ summary: "Reorder submission readiness questions" })
	@ApiResponse({ status: 200, description: "Order updated" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Questionnaire not found" })
	@Permissions({ action: Action.Update, subject: "Questionnaire" })
	async reorderSubmissionReadiness(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: ReorderSubmissionReadinessDto,
	) {
		await this.questionnaireService.reorderSubmissionReadiness(
			id,
			dto.questionIds,
			organizationId,
		);
		return { success: true };
	}
}

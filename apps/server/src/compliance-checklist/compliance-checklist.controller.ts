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
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { ComplianceChecklistService } from "./compliance-checklist.service";
import { CreateComplianceChecklistDto } from "./dto/create-compliance-checklist.dto";
import { QueryComplianceChecklistDto } from "./dto/query-compliance-checklist.dto";
import { UpdateComplianceChecklistDto } from "./dto/update-compliance-checklist.dto";

@Controller("org/compliance-checklists")
@ApiTags("Compliance Checklists")
@UseGuards(PermissionsGuard)
export class ComplianceChecklistController {
	constructor(
		private readonly complianceChecklistService: ComplianceChecklistService,
	) {}

	@Get()
	@ApiOperation({ summary: "List compliance checklist templates for an org" })
	@Permissions({ action: Action.List, subject: "ComplianceChecklist" })
	async getChecklists(
		@Session() session: UserSession,
		@Query() query: QueryComplianceChecklistDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.getChecklists(orgId, query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single compliance checklist template" })
	@Permissions({ action: Action.Read, subject: "ComplianceChecklist" })
	async getChecklist(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.getChecklist(orgId, id);
	}

	@Post()
	@ApiOperation({ summary: "Create a compliance checklist template" })
	@Permissions({ action: Action.Create, subject: "ComplianceChecklist" })
	async createChecklist(
		@Session() session: UserSession,
		@Body() dto: CreateComplianceChecklistDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.createChecklist(
			orgId,
			dto,
			session.user.id,
		);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a compliance checklist template" })
	@Permissions({ action: Action.Update, subject: "ComplianceChecklist" })
	async updateChecklist(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateComplianceChecklistDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.updateChecklist(
			orgId,
			id,
			dto,
			session.user.id,
		);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a compliance checklist template" })
	@Permissions({ action: Action.Delete, subject: "ComplianceChecklist" })
	async deleteChecklist(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.deleteChecklist(orgId, id);
	}

	@Post(":id/duplicate")
	@ApiOperation({ summary: "Duplicate a compliance checklist template" })
	@Permissions({ action: Action.Create, subject: "ComplianceChecklist" })
	async duplicateChecklist(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.complianceChecklistService.duplicateChecklist(
			orgId,
			id,
			session.user.id,
		);
	}
}

import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Session,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateOrganizationNoteDto } from "src/organizations/dto/create-organization-note.dto";
import { OrganizationNotesQueryDto } from "src/organizations/dto/organization-notes-query.dto";
import { NotesService } from "./notes.service";

@ApiTags("organizations")
@Controller("organizations/:id/notes")
@UseGuards(PermissionsGuard)
export class OrganizationNotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get()
	@ApiOperation({
		summary: "List notes for an organization with optional filters",
	})
	@ApiResponse({ status: 200, description: "List of notes" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Note" })
	async getOrganizationNotes(
		@Param("id") organizationId: string,
		@Query() query: OrganizationNotesQueryDto,
	) {
		return this.notesService.findByOrganizationId(organizationId, {
			search: query.search?.trim() || undefined,
			type: query.type,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
		});
	}

	@Post()
	@ApiOperation({ summary: "Add a note to an organization" })
	@ApiResponse({ status: 201, description: "Note added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Note" })
	async createOrganizationNote(
		@Param("id") organizationId: string,
		@Body() dto: CreateOrganizationNoteDto,
		@Session() session: UserSession,
	) {
		return this.notesService.createForOrganization(
			organizationId,
			{ type: dto.type, notes: dto.notes },
			session.user.id,
		);
	}
}

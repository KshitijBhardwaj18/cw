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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateNoteDto } from "./dto/create-note.dto";
import { NotesQueryDto } from "./dto/notes-query.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { NotesService } from "./notes.service";

@ApiTags("notes")
@Controller("notes")
@UseGuards(PermissionsGuard)
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get()
	@ApiOperation({ summary: "List notes for a vendor with optional search" })
	@ApiResponse({ status: 200, description: "List of notes" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.List, subject: "Note" })
	findByVendor(@Query() query: NotesQueryDto) {
		return this.notesService.findByVendorId(query.vendorId, {
			search: query.search?.trim() || undefined,
			type: query.type,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
		});
	}

	@Post()
	@ApiOperation({ summary: "Add a note to a vendor" })
	@ApiResponse({ status: 201, description: "Note added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Note" })
	create(@Body() dto: CreateNoteDto, @Session() session: UserSession) {
		const { vendorId, ...rest } = dto;
		return this.notesService.createForVendor(vendorId, rest, session.user.id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a note" })
	@ApiResponse({ status: 200, description: "Note updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Note not found" })
	@Permissions({ action: Action.Update, subject: "Note" })
	update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto) {
		return this.notesService.update(id, dto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a note" })
	@ApiResponse({ status: 204, description: "Note deleted successfully" })
	@ApiResponse({ status: 404, description: "Note not found" })
	@Permissions({ action: Action.Delete, subject: "Note" })
	async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
		return this.notesService.delete(id);
	}
}

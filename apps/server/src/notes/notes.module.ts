import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { OrganizationNotesController } from "./organization-notes.controller";

@Module({
	controllers: [NotesController, OrganizationNotesController],
	providers: [NotesService],
	exports: [NotesService],
})
export class NotesModule {}

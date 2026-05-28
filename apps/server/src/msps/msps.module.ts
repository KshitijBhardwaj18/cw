import { Module } from "@nestjs/common";
import { DocumentsModule } from "../documents/documents.module";
import { FilesModule } from "../files/files.module";
import { NotesModule } from "../notes/notes.module";
import { MspsController } from "./msps.controller";
import { MspsService } from "./msps.service";
import { MspLinkedOrgsService } from "./services/msp-linked-orgs.service";

@Module({
	imports: [FilesModule, DocumentsModule, NotesModule],
	controllers: [MspsController],
	providers: [MspsService, MspLinkedOrgsService],
	exports: [MspsService, MspLinkedOrgsService],
})
export class MspsModule {}

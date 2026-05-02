import { Module } from "@nestjs/common";
import { FilesModule } from "../files/files.module";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { OrganizationDocumentsController } from "./organization-documents.controller";

@Module({
	imports: [FilesModule],
	controllers: [DocumentsController, OrganizationDocumentsController],
	providers: [DocumentsService],
	exports: [DocumentsService],
})
export class DocumentsModule {}

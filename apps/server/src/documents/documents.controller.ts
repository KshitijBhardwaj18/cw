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
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { FILE_MAX_SIZE } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { DocumentsService } from "./documents.service";
import { CreateDocumentMultipartDto } from "./dto/create-document-multipart.dto";
import { DocumentsQueryDto } from "./dto/documents-query.dto";

const FILE_FIELDS = [{ name: "document", maxCount: 1 }];

@ApiTags("documents")
@Controller("documents")
@UseGuards(PermissionsGuard)
export class DocumentsController {
	constructor(private readonly documentsService: DocumentsService) {}

	@Get()
	@ApiOperation({ summary: "List documents for a vendor with optional search" })
	@ApiResponse({ status: 200, description: "List of documents" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.List, subject: "Document" })
	findByVendor(@Query() query: DocumentsQueryDto) {
		return this.documentsService.findByVendorId(query.vendorId, {
			search: query.search?.trim() || undefined,
			type: query.type,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
		});
	}

	@Get(":id/signed-url")
	@ApiOperation({ summary: "Get signed URL for document download" })
	@ApiResponse({ status: 200, description: "Signed URL for temporary access" })
	@ApiResponse({ status: 404, description: "Document not found" })
	@Permissions({ action: Action.Read, subject: "Document" })
	async getDocumentSignedUrl(@Param("id", ParseUUIDPipe) id: string) {
		const signedUrl = await this.documentsService.getDocumentSignedUrl(id);
		return { signedUrl };
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a document" })
	@ApiResponse({ status: 204, description: "Document deleted successfully" })
	@ApiResponse({ status: 404, description: "Document not found" })
	@Permissions({ action: Action.Delete, subject: "Document" })
	async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
		return this.documentsService.delete(id);
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(FILE_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["vendorId", "name", "type", "document"],
			properties: {
				vendorId: { type: "string", format: "uuid" },
				name: { type: "string" },
				type: {
					type: "string",
					enum: ["LEGAL", "MARKETING", "FINANCE", "OTHERS"],
				},
				description: { type: "string" },
				document: {
					type: "string",
					format: "binary",
					description: "PDF document (max 10MB)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Add a document with file upload to a vendor" })
	@ApiResponse({ status: 201, description: "Document added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Document" })
	create(
		@Body() dto: CreateDocumentMultipartDto,
		@UploadedFiles()
		files: { document?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const file = files?.document?.[0];
		return this.documentsService.createForVendorWithFile(
			dto.vendorId,
			{
				name: dto.name,
				type: dto.type,
				description: dto.description,
			},
			session.user.id,
			file,
		);
	}
}

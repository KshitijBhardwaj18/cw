import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Session,
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
import { UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateOrganizationDocumentMultipartDto } from "src/organizations/dto/create-organization-document-multipart.dto";
import { OrganizationDocumentsQueryDto } from "src/organizations/dto/organization-documents-query.dto";
import { DocumentsService } from "./documents.service";

const DOCUMENT_FILE_FIELDS = [{ name: "document", maxCount: 1 }];

@ApiTags("organizations")
@Controller("organizations/:id/documents")
@UseGuards(PermissionsGuard)
export class OrganizationDocumentsController {
	constructor(private readonly documentsService: DocumentsService) {}

	@Get()
	@ApiOperation({
		summary: "List documents for an organization with optional filters",
	})
	@ApiResponse({ status: 200, description: "List of documents" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Document" })
	async getOrganizationDocuments(
		@Param("id") organizationId: string,
		@Query() query: OrganizationDocumentsQueryDto,
	) {
		return this.documentsService.findByOrganizationId(organizationId, {
			search: query.search?.trim() || undefined,
			type: query.type,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
		});
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(DOCUMENT_FILE_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["name", "type", "document"],
			properties: {
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
	@ApiOperation({
		summary: "Add a document with file upload to an organization",
	})
	@ApiResponse({ status: 201, description: "Document added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Document" })
	async createOrganizationDocument(
		@Param("id") organizationId: string,
		@Body() dto: CreateOrganizationDocumentMultipartDto,
		@UploadedFiles()
		files: { document?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const file = files?.document?.[0];
		return this.documentsService.createForOrganizationWithFile(
			organizationId,
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

import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
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
import { DocumentsService } from "../documents/documents.service";
import { NotesService } from "../notes/notes.service";
import { CreateMspDocumentMultipartDto } from "./dto/create-msp-document-multipart.dto";
import { CreateMspLinkedOrgDto } from "./dto/create-msp-linked-org.dto";
import { CreateMspMultipartDto } from "./dto/create-msp-multipart.dto";
import { CreateMspNoteDto } from "./dto/create-msp-note.dto";
import { PaginatedMspsQueryDto } from "./dto/paginated-msps.dto";
import { UpdateMspLinkedOrgDto } from "./dto/update-msp-linked-org.dto";
import { MspsService } from "./msps.service";
import { MspLinkedOrgsService } from "./services/msp-linked-orgs.service";

const FILE_FIELDS = [
	{ name: "logo", maxCount: 1 },
	{ name: "msaDocument", maxCount: 1 },
];

@ApiTags("msps")
@Controller("msps")
@UseGuards(PermissionsGuard)
export class MspsController {
	constructor(
		private readonly mspsService: MspsService,
		private readonly documentsService: DocumentsService,
		private readonly notesService: NotesService,
		private readonly mspLinkedOrgsService: MspLinkedOrgsService,
	) {}

	@Get()
	@ApiOperation({ summary: "List MSPs with pagination" })
	@ApiResponse({ status: 200, description: "Paginated list of MSPs" })
	@Permissions({ action: Action.List, subject: "MSP" })
	async getMsps(@Query() query: PaginatedMspsQueryDto) {
		return this.mspsService.findAll(
			query.page,
			query.limit,
			query.search?.trim(),
		);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get MSP by ID" })
	@ApiResponse({ status: 200, description: "MSP details" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.Read, subject: "MSP" })
	async getMspById(@Param("id") id: string) {
		return this.mspsService.findOne(id);
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
			required: ["data", "msaDocument"],
			properties: {
				data: { type: "string", description: "JSON string of MSP data" },
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 2MB)",
				},
				msaDocument: {
					type: "string",
					format: "binary",
					description: "MSA PDF (max 10MB)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Create a new MSP with logo and MSA files" })
	@ApiResponse({ status: 201, description: "MSP created successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "MSP" })
	async createMsp(
		@Body() body: CreateMspMultipartDto,
		@UploadedFiles()
		files: {
			logo?: Express.Multer.File[];
			msaDocument?: Express.Multer.File[];
		},
	) {
		const data = this.parseJsonBody(body.data);
		return this.mspsService.create(data, {
			logo: files?.logo?.[0],
			msaDocument: files?.msaDocument?.[0],
		});
	}

	@Patch(":id")
	@UseInterceptors(
		FileFieldsInterceptor(FILE_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				data: { type: "string", description: "JSON string of MSP update data" },
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 2MB)",
				},
				msaDocument: {
					type: "string",
					format: "binary",
					description: "MSA PDF (max 10MB)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Update an MSP with optional logo and MSA files" })
	@ApiResponse({ status: 200, description: "MSP updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.Update, subject: "MSP" })
	async updateMsp(
		@Param("id") id: string,
		@Body() body: CreateMspMultipartDto,
		@UploadedFiles()
		files: {
			logo?: Express.Multer.File[];
			msaDocument?: Express.Multer.File[];
		},
	) {
		const data = this.parseJsonBody(body.data);
		return this.mspsService.update(id, data, {
			logo: files?.logo?.[0],
			msaDocument: files?.msaDocument?.[0],
		});
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete an MSP" })
	@ApiResponse({ status: 204, description: "MSP deleted successfully" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@Permissions({ action: Action.Delete, subject: "MSP" })
	async deleteMsp(@Param("id") id: string): Promise<void> {
		return this.mspsService.delete(id);
	}

	@Get(":id/msa-signed-url")
	@ApiOperation({ summary: "Get signed URL for MSA document download" })
	@ApiResponse({ status: 200, description: "Signed URL for temporary access" })
	@ApiResponse({ status: 404, description: "MSP or MSA not found" })
	@Permissions({ action: Action.Read, subject: "MSP" })
	async getMsaSignedUrl(@Param("id") id: string) {
		const signedUrl = await this.mspsService.getMsaSignedUrl(id);
		return { signedUrl };
	}

	@Get(":id/documents")
	@ApiOperation({ summary: "List documents for an MSP with optional search" })
	@ApiResponse({ status: 200, description: "List of documents" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.List, subject: "MSP" })
	async getMspDocuments(
		@Param("id") mspId: string,
		@Query("search") search?: string,
	) {
		return this.documentsService.findByMspId(
			mspId,
			search?.trim() || undefined,
		);
	}

	@Post(":id/documents")
	@ApiOperation({ summary: "Add a document to an MSP" })
	@ApiResponse({ status: 201, description: "Document added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.Update, subject: "MSP" })
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "document", maxCount: 1 }], {
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
				document: { type: "string", format: "binary" },
			},
		},
	})
	async createMspDocument(
		@Param("id") mspId: string,
		@Body() dto: CreateMspDocumentMultipartDto,
		@UploadedFiles()
		files: { document?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const file = files?.document?.[0];
		return this.documentsService.createForMspWithFile(
			mspId,
			{ name: dto.name, type: dto.type, description: dto.description },
			session.user.id,
			file,
		);
	}

	@Get(":id/notes")
	@ApiOperation({ summary: "List notes for an MSP with optional search" })
	@ApiResponse({ status: 200, description: "List of notes" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.List, subject: "MSP" })
	async getMspNotes(
		@Param("id") mspId: string,
		@Query("search") search?: string,
	) {
		return this.notesService.findByMspId(mspId, search?.trim() || undefined);
	}

	@Post(":id/notes")
	@ApiOperation({ summary: "Add a note to an MSP" })
	@ApiResponse({ status: 201, description: "Note added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.Update, subject: "MSP" })
	async createMspNote(
		@Param("id") mspId: string,
		@Body() dto: CreateMspNoteDto,
		@Session() session: UserSession,
	) {
		return this.notesService.createForMsp(mspId, dto, session.user.id);
	}

	@Get(":id/financial-summary")
	@ApiOperation({ summary: "Get MSP financial summary" })
	@ApiResponse({ status: 200, description: "Aggregated portfolio and revenue" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.Read, subject: "MSP" })
	async getFinancialSummary(@Param("id") mspId: string) {
		return this.mspLinkedOrgsService.getFinancialSummary(mspId);
	}

	@Get(":id/linked-orgs")
	@ApiOperation({ summary: "List linked organizations for MSP" })
	@ApiResponse({ status: 200, description: "Linked orgs with financials" })
	@ApiResponse({ status: 404, description: "MSP not found" })
	@Permissions({ action: Action.List, subject: "MSPLinkedOrg" })
	async listLinkedOrgs(@Param("id") mspId: string) {
		return this.mspLinkedOrgsService.list(mspId);
	}

	@Post(":id/linked-orgs/agreement")
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "agreement", maxCount: 1 }], {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["agreement"],
			properties: {
				agreement: {
					type: "string",
					format: "binary",
					description: "Addendum agreement PDF",
				},
			},
		},
	})
	@ApiOperation({ summary: "Upload an addendum agreement file" })
	@ApiResponse({ status: 201, description: "File uploaded" })
	@Permissions({ action: Action.Create, subject: "MSPLinkedOrg" })
	async uploadAddendumAgreement(
		@Param("id") mspId: string,
		@UploadedFiles()
		files: { agreement?: Express.Multer.File[] },
	) {
		const file = files?.agreement?.[0];
		if (!file?.buffer) {
			throw new BadRequestException("Addendum file is required.");
		}
		return this.mspLinkedOrgsService.uploadAddendum(mspId, file);
	}

	@Post(":id/linked-orgs")
	@ApiOperation({ summary: "Link an organization to MSP" })
	@ApiResponse({ status: 201, description: "Organization linked" })
	@ApiResponse({ status: 409, description: "Organization already linked" })
	@Permissions({ action: Action.Create, subject: "MSPLinkedOrg" })
	async createLinkedOrg(
		@Param("id") mspId: string,
		@Body() dto: CreateMspLinkedOrgDto,
	) {
		return this.mspLinkedOrgsService.create(mspId, dto);
	}

	@Patch(":id/linked-orgs/:linkedOrgId")
	@ApiOperation({ summary: "Update a linked organization" })
	@ApiResponse({ status: 200, description: "Linked organization updated" })
	@ApiResponse({ status: 404, description: "Linked org not found" })
	@Permissions({ action: Action.Update, subject: "MSPLinkedOrg" })
	async updateLinkedOrg(
		@Param("id") mspId: string,
		@Param("linkedOrgId") linkedOrgId: string,
		@Body() dto: UpdateMspLinkedOrgDto,
	) {
		return this.mspLinkedOrgsService.update(mspId, linkedOrgId, dto);
	}

	@Delete(":id/linked-orgs/:linkedOrgId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Unlink an organization from MSP" })
	@ApiResponse({ status: 204, description: "Unlinked" })
	@ApiResponse({ status: 404, description: "Linked org not found" })
	@Permissions({ action: Action.Delete, subject: "MSPLinkedOrg" })
	async deleteLinkedOrg(
		@Param("id") mspId: string,
		@Param("linkedOrgId") linkedOrgId: string,
	): Promise<void> {
		return this.mspLinkedOrgsService.delete(mspId, linkedOrgId);
	}

	@Get(":id/linked-orgs/:linkedOrgId/agreement-signed-url")
	@ApiOperation({ summary: "Get signed URL for addendum agreement" })
	@ApiResponse({ status: 200, description: "Signed URL" })
	@ApiResponse({
		status: 404,
		description: "Linked org or agreement not found",
	})
	@Permissions({ action: Action.Read, subject: "MSPLinkedOrg" })
	async getLinkedOrgAgreementSignedUrl(
		@Param("id") mspId: string,
		@Param("linkedOrgId") linkedOrgId: string,
	) {
		const signedUrl = await this.mspLinkedOrgsService.getAgreementSignedUrl(
			mspId,
			linkedOrgId,
		);
		return { signedUrl };
	}

	private parseJsonBody(raw: string): Record<string, unknown> {
		try {
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			throw new BadRequestException("Invalid data JSON.");
		}
	}
}

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
	Res,
	StreamableFile,
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
import { $Enums } from "@repo/db";
import { FILE_MAX_SIZE } from "@repo/shared";
import type { Response } from "express";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { ComplianceService } from "./compliance.service";
import type { ComplianceItemDto } from "./dto/compliance-item.dto";
import { CreateComplianceMultipartDto } from "./dto/create-compliance-multipart.dto";
import { PaginatedComplianceQueryDto } from "./dto/paginated-compliance-query.dto";

const COMPLIANCE_FILE_FIELDS = [{ name: "complianceDocument", maxCount: 1 }];

@Controller("compliance")
@ApiTags("Compliance")
@UseGuards(PermissionsGuard)
export class ComplianceController {
	constructor(private readonly complianceService: ComplianceService) {}

	@Get("summary")
	@Permissions({ action: Action.List, subject: "ComplianceListItem" })
	async getComplianceSummary(@Query("search") search?: string) {
		return this.complianceService.getComplianceSummary(search?.trim());
	}

	@Get()
	@Permissions({ action: Action.List, subject: "ComplianceListItem" })
	async getComplianceItems(
		@Query() query: PaginatedComplianceQueryDto,
	): Promise<ReturnType<ComplianceService["getComplianceItems"]>> {
		return this.complianceService.getComplianceItems({
			category: query.category,
			status: query.status,
			search: query.search,
			ids: query.ids,
			all: query.all,
			page: query.page,
			limit: query.limit,
		});
	}

	@Get("export.csv")
	@ApiOperation({ summary: "Export compliance list items as CSV" })
	@ApiResponse({ status: 200, description: "CSV export" })
	@Permissions({ action: Action.List, subject: "ComplianceListItem" })
	async exportComplianceItemsCsv(
		@Query() query: PaginatedComplianceQueryDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { filename, csv } =
			await this.complianceService.exportComplianceItemsCsv({
				category: query.category,
				status: query.status,
				search: query.search,
			});

		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(Buffer.from(csv, "utf-8"));
	}

	/** Lightweight read-only endpoint for org users to browse active items when building checklists */
	@Get("active")
	@ApiOperation({
		summary: "Get all active compliance list items (for org checklist builder)",
	})
	@Permissions({ action: Action.List, subject: "ComplianceListItem" })
	async getActiveComplianceItems(@Query("search") search?: string) {
		return this.complianceService.getComplianceItems({
			status: $Enums.ComplianceListItemStatus.ACTIVE,
			search: search?.trim(),
			all: true,
		});
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(COMPLIANCE_FILE_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["data"],
			properties: {
				data: {
					type: "string",
					description: "JSON string of compliance item data",
				},
				complianceDocument: {
					type: "string",
					format: "binary",
					description:
						"PDF document (max 10MB, optional when link URL provided)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Create a compliance item" })
	@ApiResponse({
		status: 201,
		description: "Compliance item created successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "ComplianceListItem" })
	async createComplianceItem(
		@Body() body: CreateComplianceMultipartDto,
		@UploadedFiles()
		files: { complianceDocument?: Express.Multer.File[] },
	): Promise<ComplianceItemDto> {
		const data = this.parseJsonBody(body.data);
		return this.complianceService.createComplianceItem(data, {
			complianceDocument: files?.complianceDocument?.[0],
		});
	}

	@Patch(":id")
	@UseInterceptors(
		FileFieldsInterceptor(COMPLIANCE_FILE_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["data"],
			properties: {
				data: {
					type: "string",
					description: "JSON string of compliance item update data",
				},
				complianceDocument: {
					type: "string",
					format: "binary",
					description: "PDF document (max 10MB, optional)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Update a compliance item" })
	@ApiResponse({
		status: 200,
		description: "Compliance item updated successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Compliance item not found" })
	@Permissions({ action: Action.Update, subject: "ComplianceListItem" })
	async updateComplianceItem(
		@Param("id") id: string,
		@Body() body: CreateComplianceMultipartDto,
		@UploadedFiles()
		files: { complianceDocument?: Express.Multer.File[] },
	): Promise<ComplianceItemDto> {
		const data = this.parseJsonBody(body.data);
		return this.complianceService.updateComplianceItem(id, data, {
			complianceDocument: files?.complianceDocument?.[0],
		});
	}

	@Get(":id/compliance-file-signed-url")
	@ApiOperation({
		summary: "Get signed URL for compliance document download",
	})
	@ApiResponse({
		status: 200,
		description: "Signed URL for temporary access",
	})
	@ApiResponse({
		status: 404,
		description: "Compliance item or file not found",
	})
	@Permissions({ action: Action.Read, subject: "ComplianceListItem" })
	async getComplianceFileSignedUrl(@Param("id") id: string) {
		const signedUrl =
			await this.complianceService.getComplianceFileSignedUrl(id);
		return { signedUrl };
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Delete, subject: "ComplianceListItem" })
	async deleteComplianceItem(@Param("id") id: string): Promise<void> {
		return this.complianceService.deleteComplianceItem(id);
	}

	private parseJsonBody(raw: string): Record<string, unknown> {
		try {
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			throw new BadRequestException("Invalid data JSON");
		}
	}
}

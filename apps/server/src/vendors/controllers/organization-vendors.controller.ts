import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
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
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateOrganizationVendorDto } from "src/organizations/dto/create-organization-vendor.dto";
import { CreateOrganizationVendorMultipartDto } from "src/organizations/dto/create-organization-vendor-multipart.dto";
import { PaginatedOrganizationVendorsQueryDto } from "src/organizations/dto/paginated-organization-vendors.dto";
import { UpdateOrganizationVendorDto } from "src/organizations/dto/update-organization-vendor.dto";
import { UpdateOrganizationVendorMultipartDto } from "src/organizations/dto/update-organization-vendor-multipart.dto";
import { OrgVendorsService } from "../services/org-vendors.service";

const ORGANIZATION_VENDOR_CONTRACT_FIELDS = [{ name: "contract", maxCount: 1 }];

/** Session-scoped `org/vendors` and explicit `organizations/:id/vendors` routes share one controller. */
@ApiTags("organizations", "vendors (org-context)")
@Controller()
@UseGuards(PermissionsGuard)
export class OrganizationVendorsController {
	constructor(private readonly orgVendorsService: OrgVendorsService) {}

	@Get("org/vendors")
	@ApiOperation({ summary: "List vendors linked to the active organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization vendors",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "OrganizationVendor" })
	async getOrgContextVendors(
		@Session() session: UserSession,
		@Query() query: PaginatedOrganizationVendorsQueryDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.orgVendorsService.findOrganizationVendorsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
		);
	}

	@Get("organizations/:id/available-vendors")
	@ApiOperation({
		summary:
			"List vendors not yet linked to an organization (for Add Vendor picker)",
	})
	@ApiResponse({
		status: 200,
		description:
			"Paginated list of vendors available to add to the organization",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Vendor" })
	async getOrganizationAvailableVendors(
		@Param("id", ParseUUIDPipe) organizationId: string,
		@Query() query: PaginatedOrganizationVendorsQueryDto,
		@Session() session: UserSession,
	) {
		return this.orgVendorsService.findAvailableVendorsForOrganization(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
		);
	}

	@Get("organizations/:id/vendors")
	@ApiOperation({ summary: "List vendors linked to an organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization vendors",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "OrganizationVendor" })
	async getOrganizationVendors(
		@Param("id") organizationId: string,
		@Query() query: PaginatedOrganizationVendorsQueryDto,
		@Session() session: UserSession,
	) {
		return this.orgVendorsService.findOrganizationVendorsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
		);
	}

	@Post("organizations/:id/vendors")
	@UseInterceptors(
		FileFieldsInterceptor(ORGANIZATION_VENDOR_CONTRACT_FIELDS, {
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
					description:
						"JSON string of organization vendor data (vendorId, status, startDate, notes)",
				},
				contract: {
					type: "string",
					format: "binary",
					description: "Contract document (PDF, DOC, DOCX, max 10MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Create organization vendor link with optional contract",
	})
	@ApiResponse({
		status: 201,
		description: "Organization vendor created successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or vendor not found" })
	@Permissions({ action: Action.Create, subject: "OrganizationVendor" })
	async createOrganizationVendor(
		@Param("id") organizationId: string,
		@Body() body: CreateOrganizationVendorMultipartDto,
		@UploadedFiles()
		files: { contract?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const dto = await this.parseAndValidateOrganizationVendorCreate(body.data);
		return this.orgVendorsService.createOrganizationVendor(
			organizationId,
			dto,
			session,
			{ contract: files?.contract?.[0] },
		);
	}

	@Put("organizations/:id/vendors/:organizationVendorId")
	@UseInterceptors(
		FileFieldsInterceptor(ORGANIZATION_VENDOR_CONTRACT_FIELDS, {
			limits: { fileSize: FILE_MAX_SIZE },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				data: {
					type: "string",
					description:
						"JSON string of organization vendor update data (status, startDate, notes)",
				},
				contract: {
					type: "string",
					format: "binary",
					description: "Contract document (PDF, DOC, DOCX, max 10MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Update an organization vendor link with optional contract",
	})
	@ApiResponse({
		status: 200,
		description: "Organization vendor updated successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or organization vendor not found",
	})
	@Permissions({ action: Action.Update, subject: "OrganizationVendor" })
	async updateOrganizationVendor(
		@Param("id") organizationId: string,
		@Param("organizationVendorId") organizationVendorId: string,
		@Body() body: UpdateOrganizationVendorMultipartDto,
		@UploadedFiles()
		files: { contract?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const dto = body.data
			? await this.parseAndValidateOrganizationVendorUpdate(body.data)
			: {};
		return this.orgVendorsService.updateOrganizationVendor(
			organizationId,
			organizationVendorId,
			dto,
			session,
			{ contract: files?.contract?.[0] },
		);
	}

	@Delete("organizations/:id/vendors/:organizationVendorId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete an organization vendor link" })
	@ApiResponse({
		status: 204,
		description: "Organization vendor deleted successfully",
	})
	@ApiResponse({
		status: 404,
		description: "Organization or organization vendor not found",
	})
	@Permissions({ action: Action.Delete, subject: "OrganizationVendor" })
	async deleteOrganizationVendor(
		@Param("id") organizationId: string,
		@Param("organizationVendorId") organizationVendorId: string,
		@Session() session: UserSession,
	): Promise<void> {
		return this.orgVendorsService.deleteOrganizationVendor(
			organizationId,
			organizationVendorId,
			session,
		);
	}

	@Get("organizations/:id/vendors/:organizationVendorId/contract-signed-url")
	@ApiOperation({ summary: "Get signed URL for organization vendor contract" })
	@ApiResponse({ status: 200, description: "Signed URL for contract document" })
	@ApiResponse({
		status: 404,
		description: "Organization or organization vendor not found",
	})
	@Permissions({ action: Action.Read, subject: "OrganizationVendor" })
	async getOrganizationVendorContractSignedUrl(
		@Param("id") organizationId: string,
		@Param("organizationVendorId") organizationVendorId: string,
		@Session() session: UserSession,
	) {
		return this.orgVendorsService.getOrganizationVendorContractSignedUrl(
			organizationId,
			organizationVendorId,
			session,
		);
	}

	private parseMultipartDataJson(raw: string): Record<string, unknown> {
		try {
			const parsed: unknown = JSON.parse(raw);
			if (
				parsed === null ||
				typeof parsed !== "object" ||
				Array.isArray(parsed)
			) {
				throw new BadRequestException("Invalid JSON in multipart data field.");
			}
			return parsed as Record<string, unknown>;
		} catch (e) {
			if (e instanceof BadRequestException) throw e;
			throw new BadRequestException("Invalid JSON in multipart data field.");
		}
	}

	private async parseAndValidateOrganizationVendorCreate(
		raw: string,
	): Promise<CreateOrganizationVendorDto> {
		const data = this.parseMultipartDataJson(raw);
		const dto = plainToInstance(CreateOrganizationVendorDto, data);
		const errors = await validate(dto, { whitelist: true });
		if (errors.length > 0) {
			const msg = Object.values(errors[0].constraints ?? {})[0];
			throw new BadRequestException(msg ?? "Validation failed");
		}
		return dto;
	}

	private async parseAndValidateOrganizationVendorUpdate(
		raw: string,
	): Promise<UpdateOrganizationVendorDto> {
		const data = this.parseMultipartDataJson(raw);
		const dto = plainToInstance(UpdateOrganizationVendorDto, data);
		const errors = await validate(dto, { whitelist: true });
		if (errors.length > 0) {
			const msg = Object.values(errors[0].constraints ?? {})[0];
			throw new BadRequestException(msg ?? "Validation failed");
		}
		return dto;
	}
}

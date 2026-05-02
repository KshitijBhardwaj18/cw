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
import { FILE_MAX_SIZE, IMAGE_MAX_SIZE } from "@repo/shared";
import {
	AllowAnonymous,
	Session,
	UserSession,
} from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateOrganizationMultipartDto } from "../dto/create-organization-multipart.dto";
import { GroupedOrganizationsQueryDto } from "../dto/grouped-organizations.dto";
import { PaginatedOrganizationsQueryDto } from "../dto/paginated-organizations.dto";
import { SendBulkInviteDto, SendInviteDto } from "../dto/send-invite.dto";
import { SlugSuggestQueryDto } from "../dto/slug.dto";
import { UpdateOrganizationMultipartDto } from "../dto/update-organization-multipart.dto";
import { OrganizationsService } from "../services/organizations.service";

const FILE_FIELDS = [
	{ name: "logo", maxCount: 1 },
	{ name: "serviceAgreement", maxCount: 1 },
];

@ApiTags("organizations")
@Controller("organizations")
@UseGuards(PermissionsGuard)
export class OrganizationsController {
	constructor(private readonly organizationsService: OrganizationsService) {}

	/** Multipart `data` is a JSON string; ValidationPipe does not parse it. */
	private parseMultipartDataJson(raw: string): Record<string, unknown> {
		try {
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			throw new BadRequestException("Invalid data JSON");
		}
	}

	@Get("public/slug/:slug")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Get public organization info by slug (no auth required)",
	})
	@ApiResponse({ status: 200, description: "Organization public profile" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	async getPublicBySlug(@Param("slug") slug: string) {
		return this.organizationsService.getPublicBySlug(slug);
	}

	@Get("slug/suggest")
	@ApiOperation({
		summary: "Preview the slug that would be generated for a given name",
	})
	@ApiResponse({
		status: 200,
		description: "Suggested slug and availability flag",
	})
	@Permissions({ action: Action.Read, subject: "Organization" })
	async suggestSlug(@Query() query: SlugSuggestQueryDto) {
		return this.organizationsService.suggestSlug(
			query.name,
			query.excludeOrganizationId,
		);
	}

	@Get("slug/:slug/check")
	@ApiOperation({ summary: "Check if a slug is available" })
	@ApiResponse({
		status: 200,
		description: "{ available: boolean, slug: string }",
	})
	@Permissions({ action: Action.Read, subject: "Organization" })
	async checkSlug(@Param("slug") slug: string) {
		return this.organizationsService.checkSlugAvailability(slug);
	}

	@Get("by-type/grouped")
	@ApiOperation({ summary: "List organizations grouped by type" })
	@ApiResponse({ status: 200, description: "Organizations grouped by type" })
	@Permissions({ action: Action.List, subject: "Organization" })
	async getOrganizationsGrouped(
		@Query() query: GroupedOrganizationsQueryDto,
		@Session() session: UserSession,
	) {
		return this.organizationsService.findGrouped(query.limitPerGroup, session);
	}

	@Get("me/membership")
	@ApiOperation({
		summary:
			"Check whether the current user is an active member of the active organization (session)",
	})
	@ApiResponse({ status: 200, description: "Active membership details" })
	@ApiResponse({ status: 403, description: "Not an active member" })
	async checkMyMembership(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.organizationsService.checkMyMembership(orgId, session.user.id);
	}

	@Get()
	@ApiOperation({ summary: "List organizations with pagination" })
	@ApiResponse({ status: 200, description: "Paginated list of organizations" })
	@Permissions({ action: Action.List, subject: "Organization" })
	async getOrganizations(
		@Query() query: PaginatedOrganizationsQueryDto,
		@Session() session: UserSession,
	) {
		return this.organizationsService.findAll(
			query.page,
			query.limit,
			session,
			query.organizationType,
			query.search?.trim(),
		);
	}

	@Get(":id/service-agreement-signed-url")
	@ApiOperation({ summary: "Get signed URL for service agreement document" })
	@ApiResponse({ status: 200, description: "Signed URL for temporary access" })
	@ApiResponse({
		status: 404,
		description: "Organization or service agreement not found",
	})
	@Permissions({ action: Action.Read, subject: "Organization" })
	async getServiceAgreementSignedUrl(
		@Param("id") id: string,
		@Session() session: UserSession,
	) {
		const signedUrl =
			await this.organizationsService.getServiceAgreementSignedUrl(id, session);
		return { signedUrl };
	}

	@Get(":id")
	@ApiOperation({ summary: "Get organization by ID" })
	@ApiResponse({ status: 200, description: "Organization details" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Read, subject: "Organization" })
	async getOrganizationById(
		@Param("id") id: string,
		@Session() session: UserSession,
	) {
		return this.organizationsService.findOne(id, session);
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(FILE_FIELDS, {
			limits: { fileSize: IMAGE_MAX_SIZE },
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
					description: "JSON string of organization data",
				},
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 2MB)",
				},
				serviceAgreement: {
					type: "string",
					format: "binary",
					description: "Service agreement (PDF, CSV, Excel, PNG, JPG, max 2MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary:
			"Create a new organization with optional logo and service agreement",
	})
	@ApiResponse({
		status: 201,
		description: "Organization created successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Organization" })
	async createOrganization(
		@Body() body: CreateOrganizationMultipartDto,
		@UploadedFiles()
		files: {
			logo?: Express.Multer.File[];
			serviceAgreement?: Express.Multer.File[];
		},
	) {
		const data = this.parseMultipartDataJson(body.data);
		return this.organizationsService.create(data, {
			logo: files?.logo?.[0],
			serviceAgreement: files?.serviceAgreement?.[0],
		});
	}

	@Put(":id")
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
				data: {
					type: "string",
					description:
						"JSON string of organization update data (optional when only uploading files)",
				},
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 10MB)",
				},
				serviceAgreement: {
					type: "string",
					format: "binary",
					description:
						"Service agreement (PDF, CSV, Excel, PNG, JPG, max 10MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Update an organization with optional logo and service agreement",
	})
	@ApiResponse({
		status: 200,
		description: "Organization updated successfully",
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Update, subject: "Organization" })
	async updateOrganization(
		@Param("id") id: string,
		@Body() body: UpdateOrganizationMultipartDto,
		@UploadedFiles()
		files: {
			logo?: Express.Multer.File[];
			serviceAgreement?: Express.Multer.File[];
		},
	) {
		const data = body.data ? this.parseMultipartDataJson(body.data) : {};
		return this.organizationsService.update(id, data, {
			logo: files?.logo?.[0],
			serviceAgreement: files?.serviceAgreement?.[0],
		});
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete an organization" })
	@ApiResponse({
		status: 204,
		description: "Organization deleted successfully",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@Permissions({ action: Action.Delete, subject: "Organization" })
	async deleteOrganization(
		@Param("id") id: string,
		@Session() session: UserSession,
	): Promise<void> {
		return this.organizationsService.delete(id, session);
	}

	@Post(":id/invitations")
	@ApiOperation({
		summary: "Send organization invitation (single, on-demand or scheduled)",
	})
	@ApiResponse({ status: 201, description: "Invite job created" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or member not found" })
	@Permissions({ action: Action.Create, subject: "User" })
	async sendInvite(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: SendInviteDto,
	) {
		const job = await this.organizationsService.submitInvite(id, dto);
		return { jobId: job.id };
	}

	@Post(":id/invitations/bulk")
	@ApiOperation({
		summary:
			"Send organization invitations in bulk (max 30 per job, on-demand or scheduled)",
	})
	@ApiResponse({ status: 201, description: "Bulk invite job created" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Create, subject: "User" })
	async sendBulkInvite(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: SendBulkInviteDto,
	) {
		const job = await this.organizationsService.submitBulkInvite(id, dto);
		return { jobId: job.id };
	}

	@Get(":id/invitations/jobs/:jobId")
	@ApiOperation({ summary: "Get invitation job status (single or bulk)" })
	@ApiResponse({ status: 200, description: "Job status and result" })
	@ApiResponse({ status: 404, description: "Job or organization not found" })
	@Permissions({ action: Action.Read, subject: "BackGroundJob" })
	async getInviteJob(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		return this.organizationsService.getInviteJob(id, jobId);
	}
}

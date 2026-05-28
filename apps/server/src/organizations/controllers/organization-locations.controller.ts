import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
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
import { IMAGE_MAX_SIZE } from "@repo/shared";
import { UserSession } from "@thallesp/nestjs-better-auth";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateLocationMultipartDto } from "../dto/create-location-multipart.dto";
import { CreateOrganizationLocationDto } from "../dto/create-organization.dto";
import { PaginatedLocationsQueryDto } from "../dto/paginated-locations.dto";
import { UpdateLocationMultipartDto } from "../dto/update-location-multipart.dto";
import { UpdateOrganizationLocationDto } from "../dto/update-organization-location.dto";
import { OrgLocationsService } from "../services/org-locations.service";

const LOCATION_PHOTO_FIELDS = [{ name: "photo", maxCount: 1 }];

/** Session-scoped `org/locations` and explicit `organizations/:id/locations` routes share one controller. */
@ApiTags("organizations", "organizations (org-context)")
@Controller()
@UseGuards(PermissionsGuard)
export class OrganizationLocationsController {
	constructor(private readonly orgLocationsService: OrgLocationsService) {}

	@Get("org/locations")
	@ApiOperation({ summary: "List locations for the active organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization locations",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "OrganizationLocation" })
	async getOrgContextLocations(
		@Session() session: UserSession,
		@Query() query: PaginatedLocationsQueryDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.orgLocationsService.findLocationsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
		);
	}

	@Get("organizations/:id/locations")
	@ApiOperation({ summary: "List locations for an organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization locations",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "OrganizationLocation" })
	async getOrganizationLocations(
		@Param("id") organizationId: string,
		@Query() query: PaginatedLocationsQueryDto,
		@Session() session: UserSession,
	) {
		return this.orgLocationsService.findLocationsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
		);
	}

	@Post("organizations/:id/locations")
	@UseInterceptors(
		FileFieldsInterceptor(LOCATION_PHOTO_FIELDS, {
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
					description:
						"JSON string of location data (name, address, city, state, zipCode, locationType, etc.)",
				},
				photo: {
					type: "string",
					format: "binary",
					description: "Location photo (PNG/JPEG, max 2MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Add a location to an organization with optional photo",
	})
	@ApiResponse({ status: 201, description: "Location created successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Create, subject: "OrganizationLocation" })
	async createOrganizationLocation(
		@Param("id") organizationId: string,
		@Body() body: CreateLocationMultipartDto,
		@UploadedFiles()
		files: { photo?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const dto = await this.parseAndValidateLocationCreate(body.data);
		return this.orgLocationsService.createLocation(
			organizationId,
			dto,
			session,
			{ photo: files?.photo?.[0] },
		);
	}

	@Put("organizations/:id/locations/:locationId")
	@UseInterceptors(
		FileFieldsInterceptor(LOCATION_PHOTO_FIELDS, {
			limits: { fileSize: IMAGE_MAX_SIZE },
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
						"JSON string of location update data (partial fields to update)",
				},
				photo: {
					type: "string",
					format: "binary",
					description: "Location photo (PNG/JPEG, max 2MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Update an organization location with optional photo",
	})
	@ApiResponse({ status: 200, description: "Location updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or location not found",
	})
	@Permissions({ action: Action.Update, subject: "OrganizationLocation" })
	async updateOrganizationLocation(
		@Param("id") organizationId: string,
		@Param("locationId") locationId: string,
		@Body() body: UpdateLocationMultipartDto,
		@UploadedFiles()
		files: { photo?: Express.Multer.File[] },
		@Session() session: UserSession,
	) {
		const dto = body.data
			? await this.parseAndValidateLocationUpdate(body.data)
			: {};
		return this.orgLocationsService.updateLocation(
			organizationId,
			locationId,
			dto,
			session,
			{ photo: files?.photo?.[0] },
		);
	}

	@Delete("organizations/:id/locations/:locationId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete an organization location" })
	@ApiResponse({ status: 204, description: "Location deleted successfully" })
	@ApiResponse({
		status: 404,
		description: "Organization or location not found",
	})
	@Permissions({ action: Action.Delete, subject: "OrganizationLocation" })
	async deleteOrganizationLocation(
		@Param("id") organizationId: string,
		@Param("locationId") locationId: string,
		@Session() session: UserSession,
	): Promise<void> {
		return this.orgLocationsService.deleteLocation(
			organizationId,
			locationId,
			session,
		);
	}

	private parseMultipartDataJson(raw: string): Record<string, unknown> {
		try {
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			throw new BadRequestException("Invalid data JSON.");
		}
	}

	private async parseAndValidateLocationCreate(
		raw: string,
	): Promise<CreateOrganizationLocationDto> {
		const data = this.parseMultipartDataJson(raw);
		const dto = plainToInstance(CreateOrganizationLocationDto, data);
		const errors = await validate(dto);
		if (errors.length > 0) {
			const msg = Object.values(errors[0].constraints ?? {})[0];
			throw new BadRequestException(msg ?? "Validation failed");
		}
		return dto;
	}

	private async parseAndValidateLocationUpdate(
		raw: string,
	): Promise<UpdateOrganizationLocationDto> {
		const data = this.parseMultipartDataJson(raw);
		const dto = plainToInstance(UpdateOrganizationLocationDto, data);
		const errors = await validate(dto, { whitelist: true });
		if (errors.length > 0) {
			const msg = Object.values(errors[0].constraints ?? {})[0];
			throw new BadRequestException(msg ?? "Validation failed");
		}
		return dto;
	}
}

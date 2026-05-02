import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
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
import { IMAGE_MAX_SIZE } from "@repo/shared";
import { Session } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import {
	AddVendorOccupationsDto,
	CreateVendorUserDto,
	UpdateVendorUserDto,
} from "../dto/create-vendor.dto";
import { CreateVendorMultipartDto } from "../dto/create-vendor-multipart.dto";
import { PaginatedVendorsQueryDto } from "../dto/paginated-vendors.dto";
import { UpdateVendorMultipartDto } from "../dto/update-vendor-multipart.dto";
import { VendorUsersQueryDto } from "../dto/vendor-users-query.dto";
import { VendorsService } from "../services/vendors.service";

const FILE_FIELDS = [{ name: "logo", maxCount: 1 }];

@ApiTags("vendors")
@Controller("vendors")
@UseGuards(PermissionsGuard)
export class VendorsController {
	constructor(private readonly vendorsService: VendorsService) {}

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
					description: "JSON string of vendor data",
				},
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 2MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Create a new vendor with optional logo",
	})
	@ApiResponse({ status: 201, description: "Vendor created successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Vendor" })
	create(
		@Body() body: CreateVendorMultipartDto,
		@UploadedFiles()
		files: { logo?: Express.Multer.File[] },
		@Session() session: { user: { id: string } },
	) {
		const data = this.parseJsonBody(body.data);
		return this.vendorsService.create(data, session.user.id, {
			logo: files?.logo?.[0],
		});
	}

	@Post(":id/occupations")
	@ApiOperation({ summary: "Add occupations to a vendor" })
	@ApiResponse({ status: 201, description: "Occupations added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.Update, subject: "Vendor" })
	setOccupations(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: AddVendorOccupationsDto,
	) {
		return this.vendorsService.setOccupations(id, dto);
	}

	@Get(":id/users")
	@ApiOperation({ summary: "List vendor users with optional search" })
	@ApiResponse({ status: 200, description: "List of vendor users" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.List, subject: "Vendor" })
	getVendorUsers(
		@Param("id", ParseUUIDPipe) id: string,
		@Query() query: VendorUsersQueryDto,
	) {
		return this.vendorsService.findVendorUsers(
			id,
			query.search?.trim() || undefined,
		);
	}

	@Post(":id/users")
	@ApiOperation({ summary: "Add a user to a vendor" })
	@ApiResponse({ status: 201, description: "User added successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.Create, subject: "Vendor" })
	addVendorUser(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: CreateVendorUserDto,
	) {
		return this.vendorsService.addVendorUser(id, dto);
	}

	@Patch(":id/users/:vendorUserId")
	@ApiOperation({ summary: "Update a vendor user" })
	@ApiResponse({ status: 200, description: "Vendor user updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Vendor or vendor user not found" })
	@Permissions({ action: Action.Update, subject: "Vendor" })
	updateVendorUser(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("vendorUserId", ParseUUIDPipe) vendorUserId: string,
		@Body() dto: UpdateVendorUserDto,
	) {
		return this.vendorsService.updateVendorUser(id, vendorUserId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List vendors with pagination" })
	@ApiResponse({ status: 200, description: "Paginated list of vendors" })
	@Permissions({ action: Action.List, subject: "Vendor" })
	findAll(@Query() query: PaginatedVendorsQueryDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 8;
		return this.vendorsService.findAll({
			page,
			limit,
			search: query.search?.trim() || undefined,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get vendor by ID" })
	@ApiResponse({ status: 200, description: "Vendor details" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.Read, subject: "Vendor" })
	findOne(@Param("id", ParseUUIDPipe) id: string) {
		return this.vendorsService.findOne(id);
	}

	@Patch(":id")
	@UseInterceptors(
		FileFieldsInterceptor(FILE_FIELDS, {
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
					description: "JSON string of vendor update data",
				},
				logo: {
					type: "string",
					format: "binary",
					description: "Logo (PNG/JPEG, max 2MB)",
				},
			},
		},
	})
	@ApiOperation({ summary: "Update a vendor with optional logo" })
	@ApiResponse({ status: 200, description: "Vendor updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.Update, subject: "Vendor" })
	update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() body: UpdateVendorMultipartDto,
		@UploadedFiles()
		files: { logo?: Express.Multer.File[] },
	) {
		const data = body.data ? this.parseJsonBody(body.data) : undefined;
		return this.vendorsService.update(id, data, {
			logo: files?.logo?.[0],
		});
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a vendor" })
	@ApiResponse({ status: 200, description: "Vendor deleted successfully" })
	@ApiResponse({ status: 404, description: "Vendor not found" })
	@Permissions({ action: Action.Delete, subject: "Vendor" })
	remove(@Param("id", ParseUUIDPipe) id: string) {
		return this.vendorsService.remove(id);
	}

	private parseJsonBody(raw: string): Record<string, unknown> {
		try {
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			throw new BadRequestException("Invalid data JSON");
		}
	}
}

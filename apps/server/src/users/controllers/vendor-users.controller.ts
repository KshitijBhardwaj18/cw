import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import {
	CreateVendorPortalUserDto,
	UpdateVendorPortalUserDto,
	VendorPortalUsersQueryDto,
} from "../dto/vendor-user.dto";
import { VendorUsersService } from "../services/vendor-users.service";

@ApiTags("vendor")
@Controller("vendor")
@UseGuards(PermissionsGuard)
export class VendorUsersController {
	constructor(private readonly vendorUsersService: VendorUsersService) {}

	@Get("me")
	@ApiOperation({
		summary:
			"Vendor context for the signed-in user (vendorId, vendor and org display names, organizationId, role)",
	})
	@ApiResponse({ status: 200, description: "Vendor context" })
	@Permissions({ action: Action.Read, subject: "User" })
	getVendorContext(@Session() session: UserSession) {
		return this.vendorUsersService.getVendorContext(session);
	}

	@Get("users/metrics")
	@ApiOperation({
		summary: "Vendor team dashboard metrics (scoped to signed-in vendor)",
	})
	@ApiResponse({ status: 200, description: "Aggregated vendor user counts" })
	@Permissions({ action: Action.Read, subject: "VendorUser" })
	getUsersMetrics(@Session() session: UserSession) {
		return this.vendorUsersService.getUsersMetrics(session);
	}

	@Get("users")
	@ApiOperation({
		summary: "List vendor portal users (paginated; scoped to signed-in vendor)",
	})
	@ApiResponse({ status: 200, description: "Paginated vendor users" })
	@Permissions({ action: Action.List, subject: "VendorUser" })
	listUsers(
		@Session() session: UserSession,
		@Query() query: VendorPortalUsersQueryDto,
	) {
		return this.vendorUsersService.listUsers(session, query);
	}

	@Post("users")
	@ApiOperation({
		summary:
			"Add a user to the signed-in vendor (delegates to vendor user provisioning)",
	})
	@ApiResponse({ status: 201, description: "User added" })
	@Permissions({ action: Action.Create, subject: "VendorUser" })
	createUser(
		@Session() session: UserSession,
		@Body() dto: CreateVendorPortalUserDto,
	) {
		return this.vendorUsersService.createUser(session, dto);
	}

	@Patch("users/:vendorUserId")
	@ApiOperation({ summary: "Update a vendor user on the signed-in vendor" })
	@ApiResponse({ status: 200, description: "User updated" })
	@Permissions({ action: Action.Update, subject: "VendorUser" })
	updateUser(
		@Session() session: UserSession,
		@Param("vendorUserId", ParseUUIDPipe) vendorUserId: string,
		@Body() dto: UpdateVendorPortalUserDto,
	) {
		return this.vendorUsersService.updateUser(session, vendorUserId, dto);
	}

	@Delete("users/:vendorUserId")
	@ApiOperation({ summary: "Remove a vendor user from the signed-in vendor" })
	@ApiResponse({ status: 200, description: "User removed" })
	@Permissions({ action: Action.Delete, subject: "VendorUser" })
	removeUser(
		@Session() session: UserSession,
		@Param("vendorUserId", ParseUUIDPipe) vendorUserId: string,
	) {
		return this.vendorUsersService.removeUser(session, vendorUserId);
	}
}

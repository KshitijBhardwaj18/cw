import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import type { MspOptionDto } from "../dto/user.dto";
import { UsersService } from "../services/users.service";

@ApiTags("users")
@Controller("users")
@UseGuards(PermissionsGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get("msp-options")
	@ApiOperation({ summary: "List MSP options for user forms" })
	@Permissions({ action: Action.List, subject: "MSP" })
	async getMspOptions(): Promise<MspOptionDto[]> {
		return this.usersService.getMspOptions();
	}

	@Get("vendor")
	@ApiOperation({ summary: "List vendor users (admin)" })
	@Permissions({ action: Action.List, subject: "User" })
	async getVendorUsers() {
		return this.usersService.getVendorUsers();
	}

	@Get("organization")
	@ApiOperation({ summary: "List organization users (admin)" })
	@Permissions({ action: Action.List, subject: "User" })
	async getOrganizationUsers() {
		return this.usersService.getOrganizationUsers();
	}
}

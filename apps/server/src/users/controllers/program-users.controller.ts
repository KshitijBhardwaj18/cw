import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action, type AppAbility } from "@repo/casl";
import { UserRole } from "@repo/db";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { CurrentAbility } from "src/common/decorators/current-ability.decorator";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import {
	CreateProgramUserDto,
	CreateProgramUsersDto,
	EditProgramUserDto,
} from "../dto/program-user.dto";
import type { UserDto } from "../dto/user.dto";
import { BulkUsersService } from "../services/bulk-users.service";
import { ProgramUsersService } from "../services/program-users.service";
import { UsersService } from "../services/users.service";

@ApiTags("users / program")
@Controller("users")
@UseGuards(PermissionsGuard)
export class ProgramUsersController {
	constructor(
		private readonly programUsersService: ProgramUsersService,
		private readonly bulkUsersService: BulkUsersService,
		private readonly usersService: UsersService,
	) {}

	@Get("program")
	@ApiOperation({ summary: "List program users" })
	@Permissions({ action: Action.List, subject: "User" })
	async getProgramUsers(): Promise<UserDto[]> {
		return this.usersService.getProgramUsers();
	}

	@Post("program")
	@ApiOperation({ summary: "Create a program user" })
	@Permissions({ action: Action.Create, subject: "User" })
	async createProgramUser(
		@Body() dto: CreateProgramUserDto,
		@CurrentAbility() ability: AppAbility,
		@Session() session: UserSession,
	): Promise<UserDto> {
		return this.programUsersService.createProgramUser(
			dto,
			ability,
			session.user.role as UserRole,
		);
	}

	@Post("program/bulk")
	@ApiOperation({ summary: "Create multiple program users" })
	@Permissions({ action: Action.Create, subject: "User" })
	async createBulkProgramUsers(
		@Body() dto: CreateProgramUsersDto,
		@CurrentAbility() ability: AppAbility,
		@Session() session: UserSession,
	): Promise<UserDto[]> {
		return this.bulkUsersService.createBulkProgramUsers(
			dto.users,
			ability,
			session.user.role as UserRole,
		);
	}

	@Put("program/:id")
	@ApiOperation({ summary: "Update a program user" })
	@Permissions({ action: Action.Update, subject: "User" })
	async updateProgramUser(
		@Param("id") id: string,
		@Body() dto: EditProgramUserDto,
		@CurrentAbility() ability: AppAbility,
		@Session() session: UserSession,
	): Promise<UserDto> {
		return this.programUsersService.updateProgramUser(
			id,
			dto,
			ability,
			session,
		);
	}

	@Delete("program/:id")
	@ApiOperation({ summary: "Delete a program user" })
	@Permissions({ action: Action.Delete, subject: "User" })
	async deleteProgramUser(
		@Param("id") id: string,
		@CurrentAbility() ability: AppAbility,
		@Session() session: UserSession,
	): Promise<boolean> {
		return this.programUsersService.deleteProgramUser(id, ability, session);
	}
}

import { subject } from "@casl/ability";
import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Action, type AppAbility } from "@repo/casl";
import { type User, UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";
import type {
	CreateProgramUserDto,
	EditProgramUserDto,
} from "../dto/program-user.dto";
import { UsersService } from "./users.service";

@Injectable()
export class ProgramUsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private assertNotOrgUserActor(actorRole: UserRole): void {
		if (actorRole === UserRole.ORGANIZATION_USER) {
			throw new ForbiddenException(
				"Organization users manage colleagues under the organization, not via program user endpoints.",
			);
		}
	}

	async createProgramUser(
		dto: CreateProgramUserDto,
		ability: AppAbility,
		actorRole: UserRole,
	) {
		this.assertNotOrgUserActor(actorRole);
		if (
			ability.cannot(Action.Create, subject("User", { role: dto.role } as User))
		) {
			throw new ForbiddenException(
				"You are not allowed to create a user with this role.",
			);
		}
		if (dto.mspId) {
			await this.validateMspRole(dto.mspId, dto.role, false);
		}

		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true, role: true },
		});
		if (existing) {
			throw new ConflictException("An account already exists with this email.");
		}

		return this.prisma.user.create({
			data: {
				name: `${dto.firstName} ${dto.lastName}`,
				email: dto.email,
				role: dto.role,
				status: dto.status,
				title: dto.title,
				phoneNumber: dto.phoneNumber,
				officePhone: dto.officePhone,
				mspId: dto.mspId,
			},
		});
	}

	async updateProgramUser(
		id: string,
		dto: EditProgramUserDto,
		ability: AppAbility,
		session: UserSession,
	) {
		const oldUser = await this.prisma.user.findUnique({
			where: { id },
			select: { role: true },
		});
		if (!oldUser) {
			throw new NotFoundException("User not found.");
		}
		if (session.user.id === id) {
			throw new ForbiddenException(
				"You are not allowed to update your own account.",
			);
		}
		if (
			ability.cannot(
				Action.Update,
				subject("User", { role: oldUser.role } as User),
			)
		) {
			throw new ForbiddenException(
				"You are not allowed to update a user with this role.",
			);
		}
		if (dto.mspId) {
			await this.validateMspRole(dto.mspId, dto.role, true);
		}
		return this.prisma.user.update({
			where: { id },
			data: {
				name: `${dto.firstName} ${dto.lastName}`,
				title: dto.title,
				officePhone: dto.officePhone,
				phoneNumber: dto.phoneNumber,
				role: dto.role,
				status: dto.status,
				mspId: dto.mspId,
				updatedAt: new Date(),
			},
		});
	}

	async deleteProgramUser(
		id: string,
		ability: AppAbility,
		session: UserSession,
	) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { role: true },
		});
		if (!user) {
			throw new NotFoundException("User not found.");
		}
		if (session.user.id === id) {
			throw new ForbiddenException(
				"You are not allowed to delete your own account.",
			);
		}
		if (
			ability.cannot(
				Action.Delete,
				subject("User", { role: user.role } as User),
			)
		) {
			throw new ForbiddenException(
				"You are not allowed to delete a user with this role.",
			);
		}
		await this.prisma.user.delete({ where: { id } });
		return true;
	}

	private async validateMspRole(
		mspId: string,
		role: UserRole,
		isUpdate = false,
	) {
		await this.usersService.validateMspExists(mspId);
		if (!["PROGRAM_MANAGER", "COMPLIANCE_MANAGER"].includes(role)) {
			throw new ForbiddenException(
				`MSP users can only be ${isUpdate ? "updated" : "created"} for Program Manager or Compliance Manager roles.`,
			);
		}
	}
}

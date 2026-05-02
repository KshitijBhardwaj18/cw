import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateSpecialtyDto } from "../dto/create-specialty.dto";
import { LinkOrgSpecialtiesBodyDto } from "../dto/link-org-specialties.dto";
import { LinkedOrgOccupationsSpecialtiesQueryDto } from "../dto/linked-org-occupations-specialties-query.dto";
import { PaginatedSpecialtyQueryDto } from "../dto/paginated-specialty-query.dto";
import { ReplaceOrgSpecialtiesBodyDto } from "../dto/replace-org-specialties.dto";
import type { SpecialtyDto } from "../dto/specialty.dto";
import { UnlinkOrgSpecialtiesBodyDto } from "../dto/unlink-org-specialties.dto";
import { UpdateSpecialtyDto } from "../dto/update-specialty.dto";
import { SpecialtiesService } from "../services/specialties.service";

@Controller("specialties")
@ApiTags("Specialties")
@UseGuards(PermissionsGuard)
export class SpecialtiesController {
	constructor(private readonly specialtiesService: SpecialtiesService) {}

	@Get()
	@Permissions({ action: Action.List, subject: "Specialty" })
	async getSpecialties(
		@Query() query: PaginatedSpecialtyQueryDto,
	): Promise<ReturnType<SpecialtiesService["getSpecialtiesPaginated"]>> {
		if (query.page || query.search) {
			return this.specialtiesService.getSpecialtiesPaginated(
				query.page ?? 1,
				query.limit ?? 10,
				query.search,
			);
		}
		const data = await this.specialtiesService.getAllSpecialties();
		return {
			data,
			total: data.length,
			page: 1,
			limit: data.length,
			totalPages: data.length > 0 ? 1 : 0,
		};
	}

	@Post()
	@Permissions({ action: Action.Create, subject: "Specialty" })
	async createSpecialty(
		@Body() createSpecialtyDto: CreateSpecialtyDto,
	): Promise<SpecialtyDto> {
		return this.specialtiesService.createSpecialty(createSpecialtyDto);
	}

	@Patch(":id")
	@Permissions({ action: Action.Update, subject: "Specialty" })
	async updateSpecialty(
		@Param("id") id: string,
		@Body() updateSpecialtyDto: UpdateSpecialtyDto,
	): Promise<SpecialtyDto> {
		return this.specialtiesService.updateSpecialty(id, updateSpecialtyDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Delete, subject: "Specialty" })
	async deleteSpecialty(@Param("id") id: string): Promise<void> {
		return this.specialtiesService.deleteSpecialty(id);
	}

	@Get("org/linked-occupations")
	@Permissions({ action: Action.List, subject: "Specialty" })
	async getDistinctSpecialtiesForSessionOrg(
		@Session() session: UserSession,
		@Query() query: LinkedOrgOccupationsSpecialtiesQueryDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.specialtiesService.getDistinctSpecialtiesForOrganizationLinkedOccupations(
			organizationId,
			{
				linkedOccupationsLimit: query.limit,
			},
		);
	}

	@Get("org/:organizationId")
	@Permissions({ action: Action.List, subject: "Specialty" })
	async getOrganizationSpecialties(
		@Param("organizationId") organizationId: string,
		@Query() query: PaginatedSpecialtyQueryDto,
	) {
		return this.specialtiesService.getOrganizationSpecialtiesPaginated(
			organizationId,
			query.page ?? 1,
			query.limit ?? 10,
			query.search,
			query.all ?? false,
		);
	}

	@Get("occupation/:occupationId")
	@Permissions({ action: Action.List, subject: "Specialty" })
	async getSpecialtiesForOccupation(
		@Param("occupationId") occupationId: string,
		@Query() query: PaginatedSpecialtyQueryDto,
	) {
		if (query.page || query.search) {
			return this.specialtiesService.getSpecialtiesForOccupationPaginated(
				occupationId,
				query.page ?? 1,
				query.limit ?? 10,
				query.search,
				query.organizationOccupationId,
			);
		}
		return this.specialtiesService.getSpecialtiesForOccupation(occupationId);
	}

	@Post("org/:organizationId/occupation/:orgOccupationId")
	@Permissions({ action: Action.Update, subject: "OrganizationSpecialty" })
	async linkSpecialties(
		@Param("organizationId") organizationId: string,
		@Param("orgOccupationId") orgOccupationId: string,
		@Body() dto: LinkOrgSpecialtiesBodyDto,
		@Session() session: UserSession,
	) {
		return this.specialtiesService.linkOrgSpecialtyToOrgOccupation({
			organizationId,
			orgOccupationId,
			specialtyIds: dto.specialtyIds,
			userId: session.user.id,
		});
	}

	@Put("org/:organizationId/occupation/:orgOccupationId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationSpecialty" })
	async replaceSpecialties(
		@Param("organizationId") organizationId: string,
		@Param("orgOccupationId") orgOccupationId: string,
		@Body() dto: ReplaceOrgSpecialtiesBodyDto,
		@Session() session: UserSession,
	): Promise<void> {
		await this.specialtiesService.replaceSpecialtiesForOrgOccupation({
			organizationId,
			orgOccupationId,
			specialtyIds: dto.specialtyIds,
			userId: session.user.id,
		});
	}

	@Delete("org/:organizationId/occupation/:orgOccupationId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationSpecialty" })
	async unlinkSpecialties(
		@Param("organizationId") organizationId: string,
		@Param("orgOccupationId") orgOccupationId: string,
		@Body() dto: UnlinkOrgSpecialtiesBodyDto,
	): Promise<void> {
		return this.specialtiesService.unlinkOrgSpecialties({
			organizationId,
			orgOccupationId,
			specialtyIds: dto.specialtyIds,
		});
	}
}

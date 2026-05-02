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
import { CreateOccupationDto } from "../dto/create-occupation.dto";
import { LinkOrgOccupationsBodyDto } from "../dto/link-org-occupations.dto";
import type { OccupationDto } from "../dto/occupation.dto";
import { PaginatedOccupationQueryDto } from "../dto/paginated-occupation-query.dto";
import { PaginatedOrgOccupationQueryDto } from "../dto/paginated-org-occupation-query.dto";
import { ReplaceOrgOccupationsBodyDto } from "../dto/replace-org-occupations.dto";
import { UnlinkOrgOccupationsBodyDto } from "../dto/unlink-org-occupations.dto";
import { UpdateOccupationDto } from "../dto/update-occupation.dto";
import { OccupationsService } from "../services/occupations.service";

@Controller("occupations")
@ApiTags("Occupations")
@UseGuards(PermissionsGuard)
export class OccupationsController {
	constructor(private readonly occupationsService: OccupationsService) {}

	@Get()
	@Permissions({ action: Action.List, subject: "Occupation" })
	async getOccupations(
		@Query() query: PaginatedOccupationQueryDto,
	): Promise<ReturnType<OccupationsService["getOccupationsPaginated"]>> {
		if (query.all) {
			const data = await this.occupationsService.getAllOccupations();
			return {
				data,
				total: data.length,
				page: 1,
				limit: data.length,
				totalPages: data.length > 0 ? 1 : 0,
			};
		}
		return this.occupationsService.getOccupationsPaginated(
			query.page ?? 1,
			query.limit ?? 10,
			query.search,
			query.status,
			query.organizationId,
		);
	}

	@Post()
	@Permissions({ action: Action.Create, subject: "Occupation" })
	async createOccupation(
		@Body() createOccupationDto: CreateOccupationDto,
	): Promise<OccupationDto> {
		return this.occupationsService.createOccupation(createOccupationDto);
	}

	@Patch(":id")
	@Permissions({ action: Action.Update, subject: "Occupation" })
	async updateOccupation(
		@Param("id") id: string,
		@Body() updateOccupationDto: UpdateOccupationDto,
	): Promise<OccupationDto> {
		return this.occupationsService.updateOccupation(id, updateOccupationDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Delete, subject: "Occupation" })
	async deleteOccupation(@Param("id") id: string): Promise<void> {
		return this.occupationsService.deleteOccupation(id);
	}

	// Org Scoped

	@Get("org/:organizationId")
	@Permissions({ action: Action.List, subject: "Occupation" })
	async getLinkedOccupations(
		@Param("organizationId") organizationId: string,
		@Query() query: PaginatedOrgOccupationQueryDto,
	) {
		return this.occupationsService.getLinkedOccupationsForOrganization(
			organizationId,
			{
				page: query.page,
				limit: query.limit,
				search: query.search,
				idsOnly: query.idsOnly,
				all: query.all,
			},
		);
	}

	@Post("org/:organizationId")
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async linkOccupation(
		@Param("organizationId") organizationId: string,
		@Body() dto: LinkOrgOccupationsBodyDto,
		@Session() session: UserSession,
	) {
		return this.occupationsService.linkOccupationsToOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
			userId: session.user.id,
		});
	}

	@Put("org/:organizationId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async replaceOccupations(
		@Param("organizationId") organizationId: string,
		@Body() dto: ReplaceOrgOccupationsBodyDto,
		@Session() session: UserSession,
	): Promise<void> {
		await this.occupationsService.replaceOccupationsForOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
			userId: session.user.id,
		});
	}

	@Delete("org/:organizationId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async unlinkOccupations(
		@Param("organizationId") organizationId: string,
		@Body() dto: UnlinkOrgOccupationsBodyDto,
	): Promise<void> {
		await this.occupationsService.unlinkOccupationsFromOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
		});
	}
}

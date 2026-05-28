import {
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
	UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { LinkOrgOccupationsBodyDto } from "../dto/link-org-occupations.dto";
import { PaginatedOrgOccupationQueryDto } from "../dto/paginated-org-occupation-query.dto";
import { ReplaceOrgOccupationsBodyDto } from "../dto/replace-org-occupations.dto";
import { UnlinkOrgOccupationsBodyDto } from "../dto/unlink-org-occupations.dto";
import { OccupationsService } from "../services/occupations.service";

/** Org portal: linked occupations scoped to the active organization (session). */
@Controller("org/occupations")
@ApiTags("Occupations (org-context)")
@UseGuards(PermissionsGuard)
export class OrgOccupationsController {
	constructor(private readonly occupationsService: OccupationsService) {}

	@Get()
	@Permissions({ action: Action.List, subject: "OrganizationOccupation" })
	async getLinkedOccupations(
		@Session() session: UserSession,
		@Query() query: PaginatedOrgOccupationQueryDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
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

	@Get(":organizationOccupationId/specialties")
	@Permissions({ action: Action.List, subject: "OrganizationOccupation" })
	async getSpecialtiesForOrgOccupation(
		@Session() session: UserSession,
		@Param("organizationOccupationId", ParseUUIDPipe)
		organizationOccupationId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.occupationsService.getOrgEnabledSpecialtiesForOccupation({
			organizationId,
			organizationOccupationId,
		});
	}

	@Post()
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async linkOccupation(
		@Session() session: UserSession,
		@Body() dto: LinkOrgOccupationsBodyDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.occupationsService.linkOccupationsToOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
			userId: session.user.id,
		});
	}

	@Put()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async replaceOccupations(
		@Session() session: UserSession,
		@Body() dto: ReplaceOrgOccupationsBodyDto,
	): Promise<void> {
		const organizationId = requireActiveOrganizationId(session);
		await this.occupationsService.replaceOccupationsForOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
			userId: session.user.id,
		});
	}

	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Update, subject: "OrganizationOccupation" })
	async unlinkOccupations(
		@Session() session: UserSession,
		@Body() dto: UnlinkOrgOccupationsBodyDto,
	): Promise<void> {
		const organizationId = requireActiveOrganizationId(session);
		await this.occupationsService.unlinkOccupationsFromOrganization({
			organizationId,
			occupationIds: dto.occupationIds,
		});
	}
}

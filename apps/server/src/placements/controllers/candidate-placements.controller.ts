import {
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CandidatePlacementsService } from "../services/candidate-placements.service";

@ApiTags("Candidate Portal / Placements")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatePlacementsController {
	constructor(
		private readonly candidatePlacementsService: CandidatePlacementsService,
	) {}

	@Get("me/placements")
	@Permissions({ action: Action.List, subject: "Placement" })
	@ApiOperation({
		summary: "Candidate's placements for an organization (grouped by tab)",
	})
	list(@Session() session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatePlacementsService.listCandidatePlacements(
			session.user.id,
			organizationId,
		);
	}

	@Get("me/placement-counts")
	@Permissions({ action: Action.Read, subject: "Placement" })
	@ApiOperation({ summary: "Candidate placement tab counts" })
	counts(@Session() session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatePlacementsService.countCandidatePlacements(
			session.user.id,
			organizationId,
		);
	}

	@Get("me/placements/:placementId")
	@Permissions({ action: Action.Read, subject: "Placement" })
	@ApiOperation({ summary: "Placement detail for candidate portal" })
	detail(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatePlacementsService.getCandidatePlacementDetail(
			session.user.id,
			organizationId,
			placementId,
		);
	}

	@Get("me/placements/:placementId/offer-history")
	@Permissions({ action: Action.List, subject: "Placement" })
	@ApiOperation({ summary: "Offer history for candidate's placement" })
	offerHistory(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatePlacementsService.getCandidatePlacementOfferHistory(
			session.user.id,
			organizationId,
			placementId,
		);
	}

	@Get("me/placements/:placementId/compliance")
	@Permissions({ action: Action.List, subject: "Placement" })
	@ApiOperation({
		summary: "Compliance requirements for candidate's placement",
	})
	compliance(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatePlacementsService.getCandidatePlacementCompliance(
			session.user.id,
			organizationId,
			placementId,
		);
	}
}

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
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { FILE_MAX_SIZE } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { resolveComplianceViewerScope } from "src/common/utils/resolve-compliance-viewer-scope";
import { AddPlacementComplianceItemDto } from "../dto/add-placement-compliance-item.dto";
import { BulkAddPlacementComplianceItemsDto } from "../dto/bulk-add-placement-compliance-items.dto";
import { QueryCredentialsDto } from "../dto/query-credentials.dto";
import { QueryUpcomingComplianceDto } from "../dto/query-upcoming-compliance.dto";
import { UpdateCandidateComplianceStatusDto } from "../dto/update-candidate-compliance-status.dto";
import { UploadCandidateComplianceDocumentDto } from "../dto/upload-candidate-compliance-document.dto";
import { PlacementComplianceService } from "../services/placement-compliance.service";

@ApiTags("Placements / Compliance")
@Controller("org/placements")
@UseGuards(PermissionsGuard)
export class PlacementComplianceController {
	constructor(
		private readonly placementComplianceService: PlacementComplianceService,
	) {}

	@Get("credentials/counts")
	@ApiOperation({
		summary:
			"Stat card counts for credentials (EXPIRING_SOON / EXPIRED / CRITICAL)",
	})
	@Permissions({ action: Action.Read, subject: "Credentials" })
	getCredentialCounts(
		@Session() session: UserSession,
		@Query() query: QueryCredentialsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.getCredentialCounts(orgId, query);
	}

	@Get("credentials")
	@ApiOperation({
		summary:
			"Expiring / expired / critical compliance items for active placements",
	})
	@Permissions({ action: Action.List, subject: "Credentials" })
	getCredentialsList(
		@Session() session: UserSession,
		@Query() query: QueryCredentialsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.getCredentialsList(orgId, query);
	}

	@Get("upcoming-compliance/counts")
	@ApiOperation({
		summary:
			"Stat card counts for upcoming compliance (TOTAL / READY / IN_PROGRESS / MISSING)",
	})
	@Permissions({ action: Action.Read, subject: "Credentials" })
	getUpcomingComplianceCounts(
		@Session() session: UserSession,
		@Query() query: QueryUpcomingComplianceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.getUpcomingComplianceCounts(
			orgId,
			query,
		);
	}

	@Get("upcoming-compliance")
	@ApiOperation({
		summary: "Upcoming placements with compliance readiness status",
	})
	@Permissions({ action: Action.List, subject: "Credentials" })
	getUpcomingComplianceList(
		@Session() session: UserSession,
		@Query() query: QueryUpcomingComplianceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.getUpcomingComplianceList(
			orgId,
			query,
		);
	}

	@Get(":placementId/compliance/available-items")
	@ApiOperation({
		summary:
			"List compliance catalog items not yet on this placement (for add picker)",
	})
	@Permissions({ action: Action.List, subject: "PlacementComplianceItem" })
	getAvailableComplianceItems(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
		@Query("search") search?: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.getAvailableComplianceListItems(
			orgId,
			placementId,
			search,
		);
	}

	@Get(":placementId/compliance")
	@ApiOperation({
		summary:
			"Placement compliance view (requisition criteria + placement extras vs candidate)",
	})
	@Permissions({ action: Action.Read, subject: "Placement" })
	getPlacementCompliance(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		const viewerScope = resolveComplianceViewerScope(session.user.role);
		return this.placementComplianceService.getPlacementCompliance(
			orgId,
			placementId,
			viewerScope,
		);
	}

	@Post(":placementId/compliance/items")
	@ApiOperation({
		summary: "Attach an extra compliance requirement to this placement",
	})
	@Permissions({ action: Action.Update, subject: "PlacementComplianceItem" })
	addPlacementComplianceItem(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: AddPlacementComplianceItemDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.addPlacementComplianceItem(
			orgId,
			placementId,
			dto,
		);
	}

	@Post(":placementId/compliance/items/bulk")
	@ApiOperation({
		summary:
			"Attach multiple compliance requirements to this placement atomically",
	})
	@Permissions({ action: Action.Update, subject: "PlacementComplianceItem" })
	bulkAddPlacementComplianceItems(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: BulkAddPlacementComplianceItemsDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.bulkAddPlacementComplianceItems(
			orgId,
			placementId,
			dto,
		);
	}

	@Delete(":placementId/compliance/items/:placementComplianceItemId")
	@ApiOperation({
		summary:
			"Remove a placement-added compliance item (soft-remove; requisition criteria remain)",
	})
	@Permissions({ action: Action.Delete, subject: "PlacementComplianceItem" })
	removePlacementComplianceItem(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("placementComplianceItemId", ParseUUIDPipe)
		placementComplianceItemId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.removePlacementComplianceItem(
			orgId,
			placementId,
			placementComplianceItemId,
		);
	}

	@Get(":placementId/credential-detail")
	@ApiOperation({
		summary:
			"Placement credential detail — candidate context + full compliance",
	})
	@Permissions({ action: Action.Read, subject: "Credentials" })
	getCredentialDetail(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		const viewerScope = resolveComplianceViewerScope(session.user.role);
		return this.placementComplianceService.getPlacementCredentialDetail(
			orgId,
			placementId,
			viewerScope,
		);
	}

	@Post(
		":placementId/compliance-items/:complianceListItemId/mark-link-submitted",
	)
	@ApiOperation({
		summary:
			"Mark a LINK-type placement compliance item as submitted (org acting on behalf)",
	})
	@Permissions({ action: Action.Update, subject: "Credentials" })
	markLinkSubmittedForPlacement(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.markComplianceLinkSubmittedForPlacement(
			orgId,
			placementId,
			complianceListItemId,
			session.user.id,
		);
	}

	@Patch(":placementId/compliance-items/:complianceListItemId/status")
	@ApiOperation({ summary: "Update a candidate compliance item status" })
	@Permissions({ action: Action.Update, subject: "Credentials" })
	updateCandidateComplianceStatus(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@Body() dto: UpdateCandidateComplianceStatusDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.updateCandidateComplianceStatus(
			orgId,
			placementId,
			complianceListItemId,
			dto,
			session.user.id,
		);
	}

	@Post(":placementId/compliance-items/:complianceListItemId/document")
	@ApiOperation({
		summary:
			"Upload a document for a candidate compliance item (server stores in S3)",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["file"],
			properties: {
				file: { type: "string", format: "binary" },
				expiryDate: {
					type: "string",
					description:
						"ISO date for document expiry (required when item uses EXPIRATION_DATE)",
				},
				issueDate: {
					type: "string",
					description:
						"ISO date for document issue (required when item uses EXPIRATION_RULE)",
				},
			},
		},
	})
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	@Permissions({ action: Action.Update, subject: "Credentials" })
	uploadCandidateComplianceDocument(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() dto: UploadCandidateComplianceDocumentDto,
		@Session() session: UserSession,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const orgId = requireActiveOrganizationId(session);
		return this.placementComplianceService.uploadCandidateComplianceDocument(
			orgId,
			placementId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
			session.user.id,
		);
	}
}

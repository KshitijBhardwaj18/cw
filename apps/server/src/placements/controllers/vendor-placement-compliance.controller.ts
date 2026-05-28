import {
	BadRequestException,
	Body,
	Controller,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { FILE_MAX_SIZE } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { requireVendorPortalActor } from "src/common/utils/resolve-vendor-actor";
import { UpdateCandidateComplianceStatusDto } from "../dto/update-candidate-compliance-status.dto";
import { UploadCandidateComplianceDocumentDto } from "../dto/upload-candidate-compliance-document.dto";
import { PlacementComplianceService } from "../services/placement-compliance.service";

@ApiTags("Vendor / Placement Compliance")
@Controller("vendor/placements")
@UseGuards(PermissionsGuard)
export class VendorPlacementComplianceController {
	constructor(
		private readonly placementComplianceService: PlacementComplianceService,
	) {}

	@Patch(":placementId/compliance-items/:complianceListItemId/status")
	@ApiOperation({
		summary:
			"Vendor portal: approve or return-to-pending a placement compliance item",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Update, subject: "Credentials" })
	updatePlacementComplianceStatus(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@Body() dto: UpdateCandidateComplianceStatusDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.placementComplianceService.vendorUpdatePlacementComplianceStatus(
			orgId,
			actor.vendorId,
			placementId,
			complianceListItemId,
			dto,
			session.user.id,
		);
	}

	@Post(
		":placementId/compliance-items/:complianceListItemId/mark-link-submitted",
	)
	@ApiOperation({
		summary:
			"Vendor portal: mark a LINK-type compliance item as submitted on behalf of a candidate",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Update, subject: "Credentials" })
	markLinkSubmitted(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.placementComplianceService.vendorMarkComplianceLinkSubmittedForPlacement(
			orgId,
			actor.vendorId,
			placementId,
			complianceListItemId,
			session.user.id,
		);
	}

	@Post(":placementId/compliance-items/:complianceListItemId/document")
	@ApiOperation({
		summary:
			"Vendor portal: upload a compliance document on behalf of a candidate for a placement",
	})
	@ApiResponse({ status: 200 })
	@ApiConsumes("multipart/form-data")
	@Permissions({ action: Action.Update, subject: "Credentials" })
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadPlacementComplianceDocument(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() dto: UploadCandidateComplianceDocumentDto,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.placementComplianceService.vendorUploadCandidateComplianceDocument(
			orgId,
			actor.vendorId,
			placementId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
			session.user.id,
		);
	}
}

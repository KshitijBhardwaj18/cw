import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
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
import { UpdateCandidateComplianceStatusDto } from "src/placements/dto/update-candidate-compliance-status.dto";
import { UploadCandidateComplianceDocumentDto } from "src/placements/dto/upload-candidate-compliance-document.dto";
import { InviteCandidateDto } from "src/talent-community/dto/invite-candidate.dto";
import { PatchVendorCandidateJobBoardProfileDto } from "../dto/patch-vendor-candidate-job-board-profile.dto";
import { QueryCandidateDocumentWalletItemsDto } from "../dto/query-candidate-document-wallet.dto";
import { QueryVendorCandidatesDto } from "../dto/query-vendor-candidates.dto";
import { QueryVendorDocumentWalletsDto } from "../dto/query-vendor-document-wallets.dto";
import { QueryVendorOnboardingDto } from "../dto/query-vendor-onboarding.dto";
import { QueueVendorOnboardingReminderDto } from "../dto/queue-vendor-onboarding-reminder.dto";
import { CandidatesDocumentWalletService } from "../services/candidates-document-wallet.service";
import { VendorCandidatesService } from "../services/vendor-candidates.service";
import { VendorOnboardingService } from "../services/vendor-onboarding.service";

@ApiTags("candidates / vendor")
@Controller("vendor/candidates")
@UseGuards(PermissionsGuard)
export class VendorCandidatesController {
	constructor(
		private readonly vendorCandidatesService: VendorCandidatesService,
		private readonly documentWalletService: CandidatesDocumentWalletService,
		private readonly vendorOnboardingService: VendorOnboardingService,
	) {}

	@Get("metrics")
	@ApiOperation({
		summary:
			"Vendor portal: aggregate counts for candidates owned by this vendor",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Read, subject: "Candidate" })
	getMetrics(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorCandidatesService.getMetrics(orgId, actor.vendorId);
	}

	@Get("document-wallets/metrics")
	@ApiOperation({
		summary:
			"Vendor portal: aggregate document wallet status across vendor-scoped candidates",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Read, subject: "CandidateCompliance" })
	getDocumentWalletsMetrics(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.getVendorDocumentWalletsMetrics(
			orgId,
			actor.vendorId,
		);
	}

	@Get("document-wallets")
	@ApiOperation({
		summary:
			"Vendor portal: paginated document wallet overview (search; status shown per row, metrics for breakdown)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "CandidateCompliance" })
	listDocumentWallets(
		@Session() session: UserSession,
		@Query() query: QueryVendorDocumentWalletsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.listVendorDocumentWallets(
			orgId,
			actor.vendorId,
			query,
		);
	}

	@Get("onboarding/metrics")
	@ApiOperation({
		summary:
			"Vendor portal: onboarding tracker metrics (upcoming placements in the next 21 days)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Read, subject: "Placement" })
	getOnboardingMetrics(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorOnboardingService.getMetrics(orgId, actor.vendorId);
	}

	@Get("onboarding")
	@ApiOperation({
		summary:
			"Vendor portal: paginated onboarding tracker cards (placement-scoped, compliance progress)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "Placement" })
	listOnboardingTracker(
		@Session() session: UserSession,
		@Query() query: QueryVendorOnboardingDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorOnboardingService.listTracker(
			orgId,
			actor.vendorId,
			query,
		);
	}

	@Post("onboarding/remind")
	@HttpCode(HttpStatus.ACCEPTED)
	@ApiOperation({
		summary:
			"Queue a candidate onboarding reminder email for one placement (BullMQ).",
	})
	@ApiResponse({ status: 202 })
	@Permissions({ action: Action.Update, subject: "Placement" })
	queueOnboardingReminder(
		@Session() session: UserSession,
		@Body() dto: QueueVendorOnboardingReminderDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorOnboardingService.queueReminderEmail(
			orgId,
			actor.vendorId,
			dto.placementId,
		);
	}

	/** Static segment first — reliable routing vs `GET /` list. */
	@Get("job-board-profile/:candidateId")
	@ApiOperation({
		summary:
			"Vendor portal: candidate profile for job board detail and submit-review forms",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404 })
	@Permissions({ action: Action.Read, subject: "Candidate" })
	getJobBoardProfile(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Query("previewOccupationId") previewOccupationId?: string,
		@Query("previewSpecialtyIds") previewSpecialtyIdsRaw?: string,
	) {
		const previewSpecialtyIds = previewSpecialtyIdsRaw
			?.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		return this.forwardJobBoardProfile(session, candidateId, {
			previewOccupationId:
				previewOccupationId && previewOccupationId.trim() !== ""
					? previewOccupationId
					: undefined,
			previewSpecialtyIds:
				previewSpecialtyIds && previewSpecialtyIds.length > 0
					? previewSpecialtyIds
					: undefined,
		});
	}

	@Get(":candidateId/profile")
	@ApiOperation({
		summary:
			"Vendor portal: candidate profile (legacy path; prefer job-board-profile/:id)",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404 })
	@Permissions({ action: Action.Read, subject: "Candidate" })
	getJobBoardProfileLegacy(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Query("previewOccupationId") previewOccupationId?: string,
		@Query("previewSpecialtyIds") previewSpecialtyIdsRaw?: string,
	) {
		const previewSpecialtyIds = previewSpecialtyIdsRaw
			?.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		return this.forwardJobBoardProfile(session, candidateId, {
			previewOccupationId:
				previewOccupationId && previewOccupationId.trim() !== ""
					? previewOccupationId
					: undefined,
			previewSpecialtyIds:
				previewSpecialtyIds && previewSpecialtyIds.length > 0
					? previewSpecialtyIds
					: undefined,
		});
	}

	private forwardJobBoardProfile(
		session: UserSession,
		candidateId: string,
		options?: {
			previewOccupationId?: string;
			previewSpecialtyIds?: string[];
		},
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorCandidatesService.getJobBoardProfile(
			orgId,
			actor.vendorId,
			candidateId,
			options,
		);
	}

	@Patch("job-board-profile/:candidateId")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			"Vendor portal: update candidate profile fields used in job-board review (before submit)",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400 })
	@ApiResponse({ status: 404 })
	@Permissions({ action: Action.Update, subject: "Candidate" })
	patchJobBoardProfile(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Body() dto: PatchVendorCandidateJobBoardProfileDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorCandidatesService.patchJobBoardProfile(
			orgId,
			actor.vendorId,
			candidateId,
			session.user.id,
			dto,
		);
	}

	@Post("invite")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary:
			"Vendor portal: invite a candidate linked to this vendor (sets candidate.vendorId)",
	})
	@ApiResponse({ status: 201 })
	@Permissions({ action: Action.Create, subject: "Candidate" })
	invite(@Session() session: UserSession, @Body() dto: InviteCandidateDto) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorCandidatesService.invite(
			orgId,
			actor.vendorId,
			dto,
			session.user.id,
		);
	}

	@Get()
	@ApiOperation({
		summary:
			"Vendor portal: paginated candidates (organization + vendor scoped)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "Candidate" })
	list(
		@Session() session: UserSession,
		@Query() query: QueryVendorCandidatesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorCandidatesService.list(orgId, actor.vendorId, query);
	}

	@Get(":candidateId/document-wallet/summary")
	@ApiOperation({
		summary:
			"Vendor portal: document wallet summary for a candidate owned by this vendor",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Read, subject: "CandidateCompliance" })
	getDocumentWalletSummary(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.getVendorCandidateDocumentWalletSummary(
			orgId,
			actor.vendorId,
			candidateId,
		);
	}

	@Get(":candidateId/document-wallet/items")
	@ApiOperation({
		summary:
			"Vendor portal: paginated wallet items (same shape as candidate self-service)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "CandidateCompliance" })
	getDocumentWalletItems(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Query() query: QueryCandidateDocumentWalletItemsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.getVendorCandidateDocumentWalletItems(
			orgId,
			actor.vendorId,
			candidateId,
			query,
		);
	}

	@Get(":candidateId/document-wallet/items/:complianceListItemId/signed-url")
	@ApiOperation({
		summary: "Vendor portal: signed download URL for a compliance document",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Read, subject: "CandidateCompliance" })
	getDocumentWalletSignedUrl(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.getVendorCandidateComplianceDocumentSignedUrl(
			orgId,
			actor.vendorId,
			candidateId,
			complianceListItemId,
		);
	}

	@Patch(":candidateId/document-wallet/items/:complianceListItemId/status")
	@ApiOperation({
		summary:
			"Vendor portal: approve compliance item or return to pending (reject verification)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	updateDocumentWalletItemStatus(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Param("complianceListItemId", ParseUUIDPipe)
		complianceListItemId: string,
		@Body() dto: UpdateCandidateComplianceStatusDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.documentWalletService.vendorUpdateCandidateComplianceStatus(
			orgId,
			actor.vendorId,
			candidateId,
			complianceListItemId,
			dto,
			session.user.id,
		);
	}

	@Post(
		":candidateId/requisitions/:requisitionId/compliance-items/:complianceListItemId/document",
	)
	@ApiOperation({
		summary:
			"Vendor portal: upload a compliance document on behalf of a candidate for a specific job",
	})
	@ApiResponse({ status: 200 })
	@ApiConsumes("multipart/form-data")
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadDocumentForRequisitionAsVendor(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
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
		return this.documentWalletService.uploadCandidateComplianceDocumentAsVendor(
			session.user.id,
			orgId,
			actor.vendorId,
			candidateId,
			requisitionId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
		);
	}
}

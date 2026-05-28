import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { FILE_MAX_SIZE } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { UploadCandidateComplianceDocumentDto } from "src/placements/dto/upload-candidate-compliance-document.dto";
import { QueryCandidateDocumentWalletItemsDto } from "../dto/query-candidate-document-wallet.dto";
import { CandidatesDocumentWalletService } from "../services/candidates-document-wallet.service";

@ApiTags("candidates / document-wallet")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatesDocumentWalletController {
	constructor(
		private readonly candidatesDocumentWalletService: CandidatesDocumentWalletService,
	) {}

	@Get("me/document-wallet/summary")
	@Permissions({ action: Action.Read, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Document wallet summary from org wallet templates (occupation/specialty); counts by status",
	})
	getDocumentWalletSummary(@Session() session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.getCandidateDocumentWalletSummary(
			session.user.id,
			organizationId,
		);
	}

	@Get("me/document-wallet/items")
	@Permissions({ action: Action.List, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Paginated requirements from org document wallet templates for the candidate's occupation/specialty",
	})
	getDocumentWalletItems(
		@Session() session: UserSession,
		@Query() query: QueryCandidateDocumentWalletItemsDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.getCandidateDocumentWalletItems(
			session.user.id,
			{
				organizationId,
				page: query.page,
				limit: query.limit,
				search: query.search,
				categoryKey: query.categoryKey,
			},
		);
	}

	@Get("me/document-wallet/upload-options")
	@Permissions({ action: Action.List, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Requirements that need upload/replace (pending upload or expired) for the upload dialog picker",
	})
	getDocumentWalletUploadOptions(@Session() session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.getCandidateDocumentWalletUploadOptions(
			session.user.id,
			organizationId,
		);
	}

	@Post("me/document-wallet/items/:complianceListItemId/document")
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary: "Upload or replace a compliance document (candidate self-service)",
	})
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadDocument(
		@Session() session: UserSession,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() dto: UploadCandidateComplianceDocumentDto,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.uploadCandidateComplianceDocumentAsCandidate(
			session.user.id,
			organizationId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
		);
	}

	@Post("me/document-wallet/items/:complianceListItemId/mark-link-submitted")
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Mark a LINK-type compliance item as submitted (no file upload required)",
	})
	markLinkSubmitted(
		@Session() session: UserSession,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.markComplianceLinkSubmittedAsCandidate(
			session.user.id,
			organizationId,
			complianceListItemId,
		);
	}

	@Post(
		"me/requisitions/:requisitionId/compliance-items/:complianceListItemId/document",
	)
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Upload or replace a compliance document required for a specific job (candidate self-service)",
	})
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadDocumentForRequisition(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() dto: UploadCandidateComplianceDocumentDto,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.uploadCandidateComplianceDocumentForRequisitionAsCandidate(
			session.user.id,
			organizationId,
			requisitionId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
		);
	}

	@Post(
		"me/requisitions/:requisitionId/compliance-items/:complianceListItemId/mark-link-submitted",
	)
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Mark a LINK-type compliance item required for a specific job as submitted",
	})
	markLinkSubmittedForRequisition(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.markComplianceLinkSubmittedForRequisitionAsCandidate(
			session.user.id,
			organizationId,
			requisitionId,
			complianceListItemId,
		);
	}

	@Post(
		"me/placements/:placementId/compliance-items/:complianceListItemId/document",
	)
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary:
			"Upload or replace a compliance document for a placement (candidate self-service)",
	})
	@ApiConsumes("multipart/form-data")
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadDocumentForPlacement(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() dto: UploadCandidateComplianceDocumentDto,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.uploadCandidateComplianceDocumentForPlacementAsCandidate(
			session.user.id,
			organizationId,
			placementId,
			complianceListItemId,
			file,
			dto.expiryDate,
			dto.issueDate,
		);
	}

	@Post(
		"me/placements/:placementId/compliance-items/:complianceListItemId/mark-link-submitted",
	)
	@Permissions({ action: Action.Update, subject: "CandidateCompliance" })
	@ApiOperation({
		summary: "Mark a LINK-type compliance item for a placement as submitted",
	})
	markLinkSubmittedForPlacement(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.markComplianceLinkSubmittedForPlacementAsCandidate(
			session.user.id,
			organizationId,
			placementId,
			complianceListItemId,
		);
	}

	@Get("me/document-wallet/items/:complianceListItemId/signed-url")
	@Permissions({ action: Action.Read, subject: "CandidateCompliance" })
	@ApiOperation({
		summary: "Temporary download URL for an uploaded compliance document",
	})
	getSignedUrl(
		@Session() session: UserSession,
		@Param("complianceListItemId", ParseUUIDPipe) complianceListItemId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.candidatesDocumentWalletService.getCandidateComplianceDocumentSignedUrl(
			session.user.id,
			organizationId,
			complianceListItemId,
		);
	}
}

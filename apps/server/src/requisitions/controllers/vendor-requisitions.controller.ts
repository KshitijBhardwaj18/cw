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
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { requireVendorPortalActor } from "src/common/utils/resolve-vendor-actor";
import { SubmissionsService } from "src/submissions/submissions.service";
import { CreateVendorCandidateSubmissionDto } from "../dto/create-vendor-candidate-submission.dto";
import { QueryVendorRequisitionCandidatesDto } from "../dto/query-vendor-requisition-candidates.dto";
import { QueryVendorRequisitionsDto } from "../dto/query-vendor-requisitions.dto";
import { VendorRequisitionsService } from "../services/vendor-requisitions.service";

@ApiTags("requisitions / vendor")
@Controller("vendor/requisitions")
@UseGuards(PermissionsGuard)
export class VendorRequisitionsController {
	constructor(
		private readonly vendorRequisitions: VendorRequisitionsService,
		private readonly submissions: SubmissionsService,
	) {}

	@Get()
	@ApiOperation({
		summary: "Vendor portal: published requisitions assigned to this vendor",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "Requisition" })
	list(
		@Session() session: UserSession,
		@Query() query: QueryVendorRequisitionsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorRequisitions.listForVendor(orgId, actor.vendorId, query);
	}

	@Get(":requisitionId")
	@ApiOperation({ summary: "Vendor portal: requisition detail for job board" })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404 })
	@Permissions({ action: Action.Read, subject: "Requisition" })
	detail(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorRequisitions.getDetailForVendor(
			orgId,
			actor.vendorId,
			actor.vendorUserId,
			requisitionId,
		);
	}

	@Post(":requisitionId/save")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Vendor portal: current vendor user saves this job to their list",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404 })
	@ApiResponse({ status: 409 })
	@Permissions({ action: Action.Create, subject: "VendorUserSavedRequisition" })
	saveJob(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorRequisitions.saveJobForVendorUser(
			orgId,
			actor.vendorId,
			actor.vendorUserId,
			requisitionId,
		);
	}

	@Delete(":requisitionId/save")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Vendor portal: current vendor user removes saved job",
	})
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404 })
	@Permissions({ action: Action.Delete, subject: "VendorUserSavedRequisition" })
	unsaveJob(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorRequisitions.unsaveJobForVendorUser(
			orgId,
			actor.vendorId,
			actor.vendorUserId,
			requisitionId,
		);
	}

	@Get(":requisitionId/candidates")
	@ApiOperation({
		summary:
			"Vendor portal: interested / matched / submitted candidates (paginated)",
	})
	@ApiResponse({ status: 200 })
	@Permissions({ action: Action.List, subject: "CandidateSubmission" })
	candidates(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
		@Query() query: QueryVendorRequisitionCandidatesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.vendorRequisitions.listCandidatesForRequisition(
			orgId,
			actor.vendorId,
			requisitionId,
			query,
		);
	}

	@Post(":requisitionId/submissions")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary:
			"Vendor portal: submit a vendor-owned candidate to this job posting",
	})
	@ApiResponse({ status: 201 })
	@Permissions({ action: Action.Create, subject: "CandidateSubmission" })
	submitCandidate(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
		@Body() dto: CreateVendorCandidateSubmissionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.submissions.createVendorSubmissionForCandidate(
			session.user.id,
			orgId,
			actor.vendorId,
			requisitionId,
			dto,
		);
	}
}

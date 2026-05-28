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
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { CreateDisputeDto } from "../dto/create-dispute.dto";
import { CreateHolidayDto } from "../dto/create-holiday.dto";
import { QueryDisputesDto } from "../dto/query-disputes.dto";
import { QueryEntriesDto } from "../dto/query-entries.dto";
import { QueryHolidaysDto } from "../dto/query-holidays.dto";
import { QueryMissingTimeDto } from "../dto/query-missing-time.dto";
import { QueryVendorTimekeepingEntriesDto } from "../dto/query-vendor-timekeeping-entries.dto";
import { RejectDisputeDto } from "../dto/reject-dispute.dto";
import { ResolveDisputeDto } from "../dto/resolve-dispute.dto";
import { SendReminderDto } from "../dto/send-reminder.dto";
import { UpdateSubmissionDeadlinePolicyDto } from "../dto/submission-deadline-policy.dto";
import { SubmitVendorTimekeepingDto } from "../dto/submit-vendor-timekeeping.dto";
import { UpdateEntryStatusDto } from "../dto/update-entry-status.dto";
import { UpdateHolidayDto } from "../dto/update-holiday.dto";
import { UpdateVendorTimekeepingEntryDto } from "../dto/update-vendor-timekeeping-entry.dto";
import { TimekeepingService } from "../services/timekeeping.service";

@ApiTags("Timekeeping")
@Controller("org/timekeeping")
@UseGuards(PermissionsGuard)
export class TimekeepingController {
	constructor(private readonly timekeepingService: TimekeepingService) {}

	@Get("stats")
	@ApiOperation({ summary: "Summary stats for timekeeping dashboard" })
	@Permissions({ action: Action.Read, subject: "Timekeeping" })
	getStats(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getStats(orgId);
	}

	@Get("entries/counts")
	@ApiOperation({
		summary: "Entry counts by status (optional filters; status ignored)",
	})
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getEntryStatusCounts(
		@Session() session: UserSession,
		@Query() query: QueryEntriesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getEntryStatusCounts(orgId, query);
	}

	@Get("entries/grouped")
	@ApiOperation({
		summary: "Entries grouped by location > department > worker",
	})
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listEntriesGrouped(
		@Session() session: UserSession,
		@Query() query: QueryEntriesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.listEntriesGrouped(orgId, query);
	}

	@Get("entries")
	@ApiOperation({ summary: "List time entries (paginated)" })
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listEntries(
		@Session() session: UserSession,
		@Query() query: QueryEntriesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.listEntries(orgId, query);
	}

	@Patch("entries/:entryId/status")
	@ApiOperation({ summary: "Approve or reject a time entry" })
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	updateEntryStatus(
		@Session() session: UserSession,
		@Param("entryId", ParseUUIDPipe) entryId: string,
		@Body() dto: UpdateEntryStatusDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.updateEntryStatus(
			orgId,
			entryId,
			dto,
			session.user.id,
		);
	}

	@Post("entries/:entryId/dispute")
	@ApiOperation({ summary: "Raise a dispute for a time entry" })
	@Permissions({ action: Action.Create, subject: "TimesheetDispute" })
	createDispute(
		@Session() session: UserSession,
		@Param("entryId", ParseUUIDPipe) entryId: string,
		@Body() dto: CreateDisputeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.createDispute(
			orgId,
			entryId,
			dto,
			session.user.id,
		);
	}

	@Post("disputes/supporting-documents")
	@ApiOperation({ summary: "Upload supporting document for dispute" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["file"],
			properties: {
				file: { type: "string", format: "binary" },
			},
		},
	})
	@Permissions({ action: Action.Create, subject: "TimesheetDispute" })
	@UseInterceptors(
		FileInterceptor("file", { limits: { fileSize: FILE_MAX_SIZE } }),
	)
	uploadDisputeSupportingDocument(
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File | undefined,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.uploadDisputeSupportingDocument(
			orgId,
			session.user.id,
			file,
		);
	}

	@Get("disputes/supporting-documents/signed-url")
	@ApiOperation({
		summary: "Temporary signed URL for dispute supporting document",
	})
	@Permissions({ action: Action.Read, subject: "TimesheetDispute" })
	getDisputeSupportingDocumentSignedUrl(
		@Session() session: UserSession,
		@Query("key") key: string,
	) {
		if (!key?.trim())
			throw new BadRequestException("Document key is required.");
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getDisputeSupportingDocumentSignedUrl(
			orgId,
			key.trim(),
		);
	}

	@Get("disputes/counts")
	@ApiOperation({ summary: "Dispute counts by status" })
	@Permissions({ action: Action.List, subject: "TimesheetDispute" })
	getDisputeStatusCounts(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getDisputeStatusCounts(orgId);
	}

	@Get("disputes")
	@ApiOperation({ summary: "List disputes (paginated)" })
	@Permissions({ action: Action.List, subject: "TimesheetDispute" })
	listDisputes(
		@Session() session: UserSession,
		@Query() query: QueryDisputesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.listDisputes(orgId, query);
	}

	@Patch("disputes/:disputeId/resolve")
	@ApiOperation({ summary: "Resolve a dispute" })
	@Permissions({ action: Action.Update, subject: "TimesheetDispute" })
	resolveDispute(
		@Session() session: UserSession,
		@Param("disputeId", ParseUUIDPipe) disputeId: string,
		@Body() dto: ResolveDisputeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.resolveDispute(
			orgId,
			disputeId,
			dto,
			session.user.id,
		);
	}

	@Patch("disputes/:disputeId/reject")
	@ApiOperation({ summary: "Reject a dispute" })
	@Permissions({ action: Action.Update, subject: "TimesheetDispute" })
	rejectDispute(
		@Session() session: UserSession,
		@Param("disputeId", ParseUUIDPipe) disputeId: string,
		@Body() dto: RejectDisputeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.rejectDispute(
			orgId,
			disputeId,
			session.user.id,
			dto,
		);
	}

	@Get("missing-time/stats")
	@ApiOperation({ summary: "Missing time case stats" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	getMissingTimeStats(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getMissingTimeStats(orgId);
	}

	@Get("missing-time")
	@ApiOperation({ summary: "List missing time cases (paginated)" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	listMissingTime(
		@Session() session: UserSession,
		@Query() query: QueryMissingTimeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.listMissingTime(orgId, query);
	}

	@Post("missing-time/:caseId/remind")
	@ApiOperation({
		summary: "Send reminder to a worker for a missing time case",
	})
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	sendReminder(
		@Session() session: UserSession,
		@Param("caseId", ParseUUIDPipe) caseId: string,
		@Body() dto: SendReminderDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.sendReminder(orgId, caseId, dto);
	}

	@Post("missing-time/bulk-remind")
	@ApiOperation({ summary: "Bulk send reminders (all or overdue)" })
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	bulkSendReminders(
		@Session() session: UserSession,
		@Query("target") target: "all" | "overdue",
		@Body() dto: SendReminderDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.bulkSendReminders(
			orgId,
			target ?? "all",
			dto,
		);
	}

	@Get("holidays/stats")
	@ApiOperation({ summary: "Holiday counts for a calendar year" })
	@Permissions({ action: Action.List, subject: "OrganizationHoliday" })
	getHolidayStats(
		@Session() session: UserSession,
		@Query("year") year?: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const y = year ? Number.parseInt(year, 10) : undefined;
		return this.timekeepingService.getHolidayStats(
			orgId,
			Number.isFinite(y) ? y : undefined,
		);
	}

	@Get("holidays")
	@ApiOperation({ summary: "List holidays for a calendar year (paginated)" })
	@Permissions({ action: Action.List, subject: "OrganizationHoliday" })
	listHolidays(
		@Session() session: UserSession,
		@Query() query: QueryHolidaysDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.listHolidays(orgId, query);
	}

	@Post("holidays")
	@ApiOperation({ summary: "Create a holiday" })
	@Permissions({ action: Action.Create, subject: "OrganizationHoliday" })
	createHoliday(
		@Session() session: UserSession,
		@Body() dto: CreateHolidayDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.createHoliday(orgId, dto);
	}

	@Delete("holidays/:holidayId")
	@ApiOperation({ summary: "Delete a holiday" })
	@Permissions({ action: Action.Delete, subject: "OrganizationHoliday" })
	deleteHoliday(
		@Session() session: UserSession,
		@Param("holidayId", ParseUUIDPipe) holidayId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.deleteHoliday(orgId, holidayId);
	}

	@Patch("holidays/:holidayId")
	@ApiOperation({ summary: "Update a holiday" })
	@Permissions({ action: Action.Update, subject: "OrganizationHoliday" })
	updateHoliday(
		@Session() session: UserSession,
		@Param("holidayId", ParseUUIDPipe) holidayId: string,
		@Body() dto: UpdateHolidayDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.updateHoliday(orgId, holidayId, dto);
	}

	@Get("policy")
	@ApiOperation({ summary: "Get submission deadline policy" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	getPolicy(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getPolicy(orgId);
	}

	@Patch("policy")
	@ApiOperation({ summary: "Update submission deadline policy" })
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	updatePolicy(
		@Session() session: UserSession,
		@Body() dto: UpdateSubmissionDeadlinePolicyDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.updatePolicy(orgId, dto);
	}

	@Post("internal-upload")
	@ApiOperation({
		summary: "Upload a timesheet CSV/Excel file for bulk import",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				file: { type: "string", format: "binary" },
			},
		},
	})
	@Permissions({ action: Action.Create, subject: "Timesheet" })
	@UseInterceptors(FileInterceptor("file"))
	internalUpload(
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.internalUpload(orgId, file, session.user.id);
	}

	@Get("internal-upload/:jobId")
	@ApiOperation({ summary: "Get internal upload job status" })
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getUploadJob(
		@Session() session: UserSession,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timekeepingService.getUploadJob(orgId, jobId);
	}

	@Get("vendor/metrics")
	@ApiOperation({
		summary: "Vendor portal: dashboard metrics for the signed-in vendor",
	})
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getVendorTimekeepingMetrics(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.getVendorTimekeepingMetrics(
			orgId,
			actor.vendorId,
		);
	}

	@Get("vendor/entries")
	@ApiOperation({
		summary: "Vendor portal: paginated time entries for the vendor",
	})
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listVendorTimekeepingEntries(
		@Session() session: UserSession,
		@Query() query: QueryVendorTimekeepingEntriesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.listVendorTimekeepingEntries(
			orgId,
			actor.vendorId,
			query,
		);
	}

	@Get("vendor/pay-codes")
	@ApiOperation({
		summary: "Vendor portal: list active pay codes for time entry updates",
	})
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listVendorPayCodes(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		resolveVendorActor(session);
		return this.timekeepingService.listActivePayCodes(orgId);
	}

	@Patch("vendor/entries/:entryId")
	@ApiOperation({
		summary:
			"Vendor portal: update a draft or pending time entry (clock times / notes)",
	})
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	updateVendorTimekeepingEntry(
		@Session() session: UserSession,
		@Param("entryId", ParseUUIDPipe) entryId: string,
		@Body() dto: UpdateVendorTimekeepingEntryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.updateVendorTimekeepingEntry(
			orgId,
			actor.vendorId,
			entryId,
			dto,
		);
	}

	@Post("vendor/submit")
	@ApiOperation({
		summary:
			"Vendor portal: submit draft entries to the organization (default: all drafts)",
	})
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	submitVendorTimekeepingDrafts(
		@Session() session: UserSession,
		@Body() dto: SubmitVendorTimekeepingDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.submitVendorTimekeepingDrafts(
			orgId,
			actor.vendorId,
			dto,
		);
	}

	@Post("vendor/internal-upload")
	@ApiOperation({
		summary:
			"Vendor portal: bulk-upload timesheet entries (CSV/Excel) for the vendor's own candidates",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: { file: { type: "string", format: "binary" } },
		},
	})
	@Permissions({ action: Action.Create, subject: "Timesheet" })
	@UseInterceptors(FileInterceptor("file"))
	vendorInternalUpload(
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.internalUpload(
			orgId,
			file,
			session.user.id,
			actor.vendorId,
		);
	}

	@Get("vendor/internal-upload/:jobId")
	@ApiOperation({
		summary: "Vendor portal: get internal upload job status",
	})
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getVendorUploadJob(
		@Session() session: UserSession,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.timekeepingService.getUploadJob(orgId, jobId, actor.vendorId);
	}
}

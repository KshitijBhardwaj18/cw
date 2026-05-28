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
import { CreateDisputeDto } from "../dto/create-dispute.dto";
import { CreateHolidayDto } from "../dto/create-holiday.dto";
import { QueryDisputesDto } from "../dto/query-disputes.dto";
import { QueryEntriesDto } from "../dto/query-entries.dto";
import { QueryHolidaysDto } from "../dto/query-holidays.dto";
import { QueryMissingTimeDto } from "../dto/query-missing-time.dto";
import { RejectDisputeDto } from "../dto/reject-dispute.dto";
import { ResolveDisputeDto } from "../dto/resolve-dispute.dto";
import { SendReminderDto } from "../dto/send-reminder.dto";
import { UpdateSubmissionDeadlinePolicyDto } from "../dto/submission-deadline-policy.dto";
import { UpdateEntryStatusDto } from "../dto/update-entry-status.dto";
import { UpdateHolidayDto } from "../dto/update-holiday.dto";
import { TimekeepingService } from "../services/timekeeping.service";

/**
 * Admin / explicit-org routes: same behavior as `org/timekeeping/*` but `organizationId` comes from the path
 * (e.g. platform admin viewing an organization without switching active org session).
 */
@ApiTags("Timekeeping")
@Controller("organizations/:organizationId/timekeeping")
@UseGuards(PermissionsGuard)
export class OrganizationTimekeepingController {
	constructor(private readonly timekeepingService: TimekeepingService) {}

	@Get("stats")
	@ApiOperation({
		summary:
			"Summary stats for timekeeping dashboard (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "Timekeeping" })
	getStats(@Param("organizationId", ParseUUIDPipe) organizationId: string) {
		return this.timekeepingService.getStats(organizationId);
	}

	@Get("entries/counts")
	@ApiOperation({
		summary: "Entry counts by status (optional filters; status ignored)",
	})
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getEntryStatusCounts(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryEntriesDto,
	) {
		return this.timekeepingService.getEntryStatusCounts(organizationId, query);
	}

	@Get("entries/grouped")
	@ApiOperation({
		summary: "Entries grouped by location > department > worker",
	})
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listEntriesGrouped(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryEntriesDto,
	) {
		return this.timekeepingService.listEntriesGrouped(organizationId, query);
	}

	@Get("entries")
	@ApiOperation({ summary: "List time entries (paginated)" })
	@Permissions({ action: Action.List, subject: "Timesheet" })
	listEntries(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryEntriesDto,
	) {
		return this.timekeepingService.listEntries(organizationId, query);
	}

	@Get("pay-codes")
	@ApiOperation({
		summary: "List active pay codes for timekeeping (explicit organization id)",
	})
	@Permissions({ action: Action.List, subject: "OrganizationPayCode" })
	listPayCodes(@Param("organizationId", ParseUUIDPipe) organizationId: string) {
		return this.timekeepingService.listActivePayCodes(organizationId);
	}

	@Patch("entries/:entryId/status")
	@ApiOperation({ summary: "Approve or reject a time entry" })
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	updateEntryStatus(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@Param("entryId", ParseUUIDPipe) entryId: string,
		@Body() dto: UpdateEntryStatusDto,
	) {
		return this.timekeepingService.updateEntryStatus(
			organizationId,
			entryId,
			dto,
			session.user.id,
		);
	}

	@Post("entries/:entryId/dispute")
	@ApiOperation({ summary: "Raise a dispute for a time entry" })
	@Permissions({ action: Action.Create, subject: "TimesheetDispute" })
	createDispute(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@Param("entryId", ParseUUIDPipe) entryId: string,
		@Body() dto: CreateDisputeDto,
	) {
		return this.timekeepingService.createDispute(
			organizationId,
			entryId,
			dto,
			session.user.id,
		);
	}

	@Post("disputes/supporting-documents")
	@ApiOperation({
		summary:
			"Upload supporting document for dispute (explicit organization id)",
	})
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
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File | undefined,
	) {
		if (!file?.buffer?.length) {
			throw new BadRequestException("File is required.");
		}
		return this.timekeepingService.uploadDisputeSupportingDocument(
			organizationId,
			session.user.id,
			file,
		);
	}

	@Get("disputes/supporting-documents/signed-url")
	@ApiOperation({
		summary:
			"Temporary signed URL for dispute supporting document (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "TimesheetDispute" })
	getDisputeSupportingDocumentSignedUrl(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query("key") key: string,
	) {
		if (!key?.trim())
			throw new BadRequestException("Document key is required.");
		return this.timekeepingService.getDisputeSupportingDocumentSignedUrl(
			organizationId,
			key.trim(),
		);
	}

	@Get("disputes/counts")
	@ApiOperation({ summary: "Dispute counts by status" })
	@Permissions({ action: Action.List, subject: "TimesheetDispute" })
	getDisputeStatusCounts(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.timekeepingService.getDisputeStatusCounts(organizationId);
	}

	@Get("disputes")
	@ApiOperation({ summary: "List disputes (paginated)" })
	@Permissions({ action: Action.List, subject: "TimesheetDispute" })
	listDisputes(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryDisputesDto,
	) {
		return this.timekeepingService.listDisputes(organizationId, query);
	}

	@Patch("disputes/:disputeId/resolve")
	@ApiOperation({ summary: "Resolve a dispute" })
	@Permissions({ action: Action.Update, subject: "TimesheetDispute" })
	resolveDispute(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@Param("disputeId", ParseUUIDPipe) disputeId: string,
		@Body() dto: ResolveDisputeDto,
	) {
		return this.timekeepingService.resolveDispute(
			organizationId,
			disputeId,
			dto,
			session.user.id,
		);
	}

	@Patch("disputes/:disputeId/reject")
	@ApiOperation({ summary: "Reject a dispute" })
	@Permissions({ action: Action.Update, subject: "TimesheetDispute" })
	rejectDispute(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@Param("disputeId", ParseUUIDPipe) disputeId: string,
		@Body() dto: RejectDisputeDto,
	) {
		return this.timekeepingService.rejectDispute(
			organizationId,
			disputeId,
			session.user.id,
			dto,
		);
	}

	@Get("missing-time/stats")
	@ApiOperation({ summary: "Missing time case stats" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	getMissingTimeStats(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.timekeepingService.getMissingTimeStats(organizationId);
	}

	@Get("missing-time")
	@ApiOperation({ summary: "List missing time cases (paginated)" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	listMissingTime(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryMissingTimeDto,
	) {
		return this.timekeepingService.listMissingTime(organizationId, query);
	}

	@Post("missing-time/:caseId/remind")
	@ApiOperation({
		summary: "Send reminder to a worker for a missing time case",
	})
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	sendReminder(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("caseId", ParseUUIDPipe) caseId: string,
		@Body() dto: SendReminderDto,
	) {
		return this.timekeepingService.sendReminder(organizationId, caseId, dto);
	}

	@Post("missing-time/bulk-remind")
	@ApiOperation({ summary: "Bulk send reminders (all or overdue)" })
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	bulkSendReminders(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query("target") target: "all" | "overdue",
		@Body() dto: SendReminderDto,
	) {
		return this.timekeepingService.bulkSendReminders(
			organizationId,
			target ?? "all",
			dto,
		);
	}

	@Get("holidays/stats")
	@ApiOperation({ summary: "Holiday counts for a calendar year" })
	@Permissions({ action: Action.List, subject: "OrganizationHoliday" })
	getHolidayStats(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query("year") year?: string,
	) {
		const y = year ? Number.parseInt(year, 10) : undefined;
		return this.timekeepingService.getHolidayStats(
			organizationId,
			Number.isFinite(y) ? y : undefined,
		);
	}

	@Get("holidays")
	@ApiOperation({ summary: "List holidays for a calendar year (paginated)" })
	@Permissions({ action: Action.List, subject: "OrganizationHoliday" })
	listHolidays(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryHolidaysDto,
	) {
		return this.timekeepingService.listHolidays(organizationId, query);
	}

	@Post("holidays")
	@ApiOperation({ summary: "Create a holiday" })
	@Permissions({ action: Action.Create, subject: "OrganizationHoliday" })
	createHoliday(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: CreateHolidayDto,
	) {
		return this.timekeepingService.createHoliday(organizationId, dto);
	}

	@Delete("holidays/:holidayId")
	@ApiOperation({ summary: "Delete a holiday" })
	@Permissions({ action: Action.Delete, subject: "OrganizationHoliday" })
	deleteHoliday(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("holidayId", ParseUUIDPipe) holidayId: string,
	) {
		return this.timekeepingService.deleteHoliday(organizationId, holidayId);
	}

	@Patch("holidays/:holidayId")
	@ApiOperation({ summary: "Update a holiday" })
	@Permissions({ action: Action.Update, subject: "OrganizationHoliday" })
	updateHoliday(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("holidayId", ParseUUIDPipe) holidayId: string,
		@Body() dto: UpdateHolidayDto,
	) {
		return this.timekeepingService.updateHoliday(
			organizationId,
			holidayId,
			dto,
		);
	}

	@Get("policy")
	@ApiOperation({ summary: "Get submission deadline policy" })
	@Permissions({ action: Action.List, subject: "MissingTimeCase" })
	getPolicy(@Param("organizationId", ParseUUIDPipe) organizationId: string) {
		return this.timekeepingService.getPolicy(organizationId);
	}

	@Patch("policy")
	@ApiOperation({ summary: "Update submission deadline policy" })
	@Permissions({ action: Action.Update, subject: "MissingTimeCase" })
	updatePolicy(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: UpdateSubmissionDeadlinePolicyDto,
	) {
		return this.timekeepingService.updatePolicy(organizationId, dto);
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
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File,
	) {
		return this.timekeepingService.internalUpload(
			organizationId,
			file,
			session.user.id,
		);
	}

	@Get("internal-upload/:jobId")
	@ApiOperation({ summary: "Get internal upload job status" })
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	getUploadJob(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		return this.timekeepingService.getUploadJob(organizationId, jobId);
	}
}

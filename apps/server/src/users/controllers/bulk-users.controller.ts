import type { MessageEvent } from "@nestjs/common";
import {
	Controller,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Sse,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { UserRole } from "@repo/db";
import { BULK_ENROLLMENT_FILE_MAX_BYTES } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { Observable } from "rxjs";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { BulkEnrollmentFilePipe } from "src/common/pipes/bulk-enrollment-file.pipe";
import { BulkUsersService } from "../services/bulk-users.service";

@ApiTags("users / bulk")
@Controller("users")
@UseGuards(PermissionsGuard)
export class BulkUsersController {
	constructor(private readonly bulkUsersService: BulkUsersService) {}

	@Post("program/bulk/upload")
	@HttpCode(HttpStatus.ACCEPTED)
	@UseInterceptors(
		FileInterceptor("file", {
			limits: { fileSize: BULK_ENROLLMENT_FILE_MAX_BYTES },
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["file"],
			properties: {
				file: {
					type: "string",
					format: "binary",
					description: "CSV file (max 5MB)",
				},
			},
		},
	})
	@ApiOperation({
		summary: "Submit bulk platform users import via CSV (async job)",
	})
	@ApiResponse({
		status: 202,
		description: "Job created",
		schema: { properties: { jobId: { type: "string" } } },
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "User" })
	async submitBulkPlatformUsers(
		@UploadedFile(BulkEnrollmentFilePipe) file: Express.Multer.File,
		@Session() session: UserSession,
	) {
		const job = await this.bulkUsersService.submitBulkPlatformUsers(
			file,
			session.user.role as UserRole,
		);
		return { jobId: job.id };
	}

	@Sse("program/bulk/jobs/:jobId/stream")
	@Header("X-Accel-Buffering", "no")
	@ApiOperation({ summary: "Stream bulk platform users job status via SSE" })
	@ApiResponse({ status: 200, description: "SSE stream of job status events" })
	@ApiResponse({ status: 404, description: "Job not found" })
	@Permissions({ action: Action.Read, subject: "User" })
	streamBulkPlatformUsersJob(
		@Param("jobId", ParseUUIDPipe) jobId: string,
	): Observable<MessageEvent> {
		return this.bulkUsersService.streamBulkPlatformUsersJob(jobId);
	}

	@Get("program/bulk/jobs/:jobId")
	@ApiOperation({ summary: "Get bulk platform users job status" })
	@ApiResponse({ status: 200, description: "Job status and result" })
	@ApiResponse({ status: 404, description: "Job not found" })
	@Permissions({ action: Action.Read, subject: "User" })
	async getBulkPlatformUsersJob(@Param("jobId", ParseUUIDPipe) jobId: string) {
		return this.bulkUsersService.getBulkPlatformUsersJob(jobId);
	}
}

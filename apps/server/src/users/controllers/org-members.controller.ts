import type { MessageEvent } from "@nestjs/common";
import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
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
import { BULK_ENROLLMENT_FILE_MAX_BYTES } from "@repo/shared";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import type { Observable } from "rxjs";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { BulkEnrollmentFilePipe } from "src/common/pipes/bulk-enrollment-file.pipe";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import {
	EnrollExistingUserDto,
	EnrollOrgUserDto,
	OrgMembersQueryDto,
	OrgPickerQueryDto,
	UpdateOrgMemberDto,
} from "src/organizations/dto/organization-members.dto";
import { OrgMembersService } from "../services/org-members.service";

/** `org/members/*` (session org) and `organizations/:id/*` (explicit org id) share one controller. */
@ApiTags("organizations", "users (org-context)")
@Controller()
@UseGuards(PermissionsGuard)
export class OrgMembersController {
	constructor(private readonly orgMembersService: OrgMembersService) {}

	// --- Session: active organization from session ---

	@Get("org/members")
	@ApiOperation({ summary: "List members enrolled in the active organization" })
	@ApiResponse({ status: 200, description: "List of enrolled members" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Member" })
	async getOrgMembersFromSession(
		@Session() session: UserSession,
		@Query() query: OrgMembersQueryDto,
	) {
		const id = requireActiveOrganizationId(session);
		return this.orgMembersService.getOrgMembers(id, query);
	}

	@Post("org/members/org-user")
	@ApiOperation({
		summary: "Create a new org user and enroll them in the active organization",
	})
	@ApiResponse({ status: 201, description: "User created and enrolled" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@ApiResponse({ status: 409, description: "Email already in use" })
	@Permissions({ action: Action.Create, subject: "User" })
	async enrollOrgUserFromSession(
		@Session() session: UserSession,
		@Body() dto: EnrollOrgUserDto,
	) {
		const id = requireActiveOrganizationId(session);
		return this.orgMembersService.enrollOrgUser(id, dto);
	}

	@Post("org/members")
	@ApiOperation({
		summary:
			"Enroll an existing platform or vendor user in the active organization",
	})
	@ApiResponse({ status: 201, description: "User enrolled" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or user not found" })
	@ApiResponse({ status: 409, description: "User already enrolled" })
	@Permissions({ action: Action.Create, subject: "Member" })
	async enrollExistingUserFromSession(
		@Session() session: UserSession,
		@Body() dto: EnrollExistingUserDto,
	) {
		const id = requireActiveOrganizationId(session);
		return this.orgMembersService.enrollExistingUser(id, dto);
	}

	@Delete("org/members/:memberId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Remove a member from the active organization" })
	@ApiResponse({ status: 204, description: "Member removed" })
	@ApiResponse({ status: 404, description: "Organization or member not found" })
	@Permissions({ action: Action.Delete, subject: "Member" })
	async removeMemberFromSession(
		@Session() session: UserSession,
		@Param("memberId", ParseUUIDPipe) memberId: string,
	) {
		const id = requireActiveOrganizationId(session);
		await this.orgMembersService.removeMember(id, memberId);
	}

	@Patch("org/members/:memberId")
	@ApiOperation({ summary: "Update an organization member" })
	@ApiResponse({ status: 200, description: "Updated member" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or member not found" })
	@Permissions({ action: Action.Update, subject: "Member" })
	async updateOrgMemberFromSession(
		@Session() session: UserSession,
		@Param("memberId", ParseUUIDPipe) memberId: string,
		@Body() dto: UpdateOrgMemberDto,
	) {
		const id = requireActiveOrganizationId(session);
		return this.orgMembersService.updateOrgMember(
			id,
			memberId,
			dto,
			session.user.id,
		);
	}

	@Post("org/members/bulk")
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
		summary: "Submit bulk organization user enrollment via CSV (async job)",
	})
	@ApiResponse({
		status: 202,
		description: "Job created",
		schema: { properties: { jobId: { type: "string" } } },
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Create, subject: "User" })
	async submitBulkEnrollmentFromSession(
		@Session() session: UserSession,
		@UploadedFile(BulkEnrollmentFilePipe) file: Express.Multer.File,
	) {
		const id = requireActiveOrganizationId(session);
		const job = await this.orgMembersService.submitBulkEnrollment(id, file);
		return { jobId: job.id };
	}

	@Sse("org/members/bulk/jobs/:jobId/stream")
	@Header("X-Accel-Buffering", "no")
	@ApiOperation({ summary: "Stream bulk enrollment job status via SSE" })
	@ApiResponse({ status: 200, description: "SSE stream of job status events" })
	@ApiResponse({ status: 404, description: "Job or organization not found" })
	@Permissions({ action: Action.Read, subject: "BackGroundJob" })
	streamBulkEnrollmentJobFromSession(
		@Session() session: UserSession,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	): Observable<MessageEvent> {
		const orgId = requireActiveOrganizationId(session);
		return this.orgMembersService.streamBulkEnrollmentJob(orgId, jobId);
	}

	@Get("org/members/bulk/jobs/:jobId")
	@ApiOperation({ summary: "Get bulk enrollment job status" })
	@ApiResponse({ status: 200, description: "Job status and result" })
	@ApiResponse({ status: 404, description: "Job or organization not found" })
	@Permissions({ action: Action.Read, subject: "BackGroundJob" })
	async getBulkEnrollmentJobFromSession(
		@Session() session: UserSession,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		const id = requireActiveOrganizationId(session);
		return this.orgMembersService.getBulkEnrollmentJob(id, jobId);
	}

	// --- Explicit organization id in path ---

	@Post("organizations/:id/members/org-user")
	@ApiOperation({
		summary: "Create a new org user and enroll them in this organization",
	})
	@ApiResponse({ status: 201, description: "User created and enrolled" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@ApiResponse({ status: 409, description: "Email already in use" })
	@Permissions({ action: Action.Create, subject: "User" })
	async enrollOrgUser(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: EnrollOrgUserDto,
	) {
		return this.orgMembersService.enrollOrgUser(id, dto);
	}

	@Post("organizations/:id/members")
	@ApiOperation({
		summary: "Enroll an existing platform or vendor user in this organization",
	})
	@ApiResponse({ status: 201, description: "User enrolled" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or user not found" })
	@ApiResponse({ status: 409, description: "User already enrolled" })
	@Permissions({ action: Action.Create, subject: "Member" })
	async enrollExistingUser(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: EnrollExistingUserDto,
	) {
		return this.orgMembersService.enrollExistingUser(id, dto);
	}

	@Delete("organizations/:id/members/:memberId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Remove a member from this organization" })
	@ApiResponse({ status: 204, description: "Member removed" })
	@ApiResponse({ status: 404, description: "Organization or member not found" })
	@Permissions({ action: Action.Delete, subject: "Member" })
	async removeMember(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("memberId", ParseUUIDPipe) memberId: string,
	) {
		await this.orgMembersService.removeMember(id, memberId);
	}

	@Patch("organizations/:id/members/:memberId")
	@ApiOperation({ summary: "Update an organization member" })
	@ApiResponse({ status: 200, description: "Updated member" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization or member not found" })
	@Permissions({ action: Action.Update, subject: "Member" })
	async updateOrgMember(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("memberId", ParseUUIDPipe) memberId: string,
		@Body() dto: UpdateOrgMemberDto,
		@Session() session: UserSession,
	) {
		return this.orgMembersService.updateOrgMember(
			id,
			memberId,
			dto,
			session.user.id,
		);
	}

	@Get("organizations/:id/members")
	@ApiOperation({ summary: "List members enrolled in this organization" })
	@ApiResponse({ status: 200, description: "List of enrolled members" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Member" })
	async getOrgMembers(
		@Param("id", ParseUUIDPipe) id: string,
		@Query() query: OrgMembersQueryDto,
	) {
		return this.orgMembersService.getOrgMembers(id, query);
	}

	@Get("organizations/:id/program-users")
	@ApiOperation({
		summary:
			"List program users available for enrollment (excludes admins and already-enrolled users)",
	})
	@ApiResponse({ status: 200, description: "List of eligible program users" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "User" })
	async getOrgProgramUsers(
		@Param("id", ParseUUIDPipe) id: string,
		@Query() query: OrgPickerQueryDto,
	) {
		return this.orgMembersService.getOrgProgramUsers(
			id,
			query.search,
			query.limit,
			query.cursor,
		);
	}

	@Get("organizations/:id/vendor-users")
	@ApiOperation({
		summary:
			"List vendor users available for enrollment (vendor linked to this org, not yet enrolled)",
	})
	@ApiResponse({ status: 200, description: "List of eligible vendor users" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "User" })
	async getOrgVendorUsers(
		@Param("id", ParseUUIDPipe) id: string,
		@Query() query: OrgPickerQueryDto,
	) {
		return this.orgMembersService.getOrgVendorUsers(
			id,
			query.search,
			query.limit,
			query.cursor,
		);
	}

	@Post("organizations/:id/members/bulk")
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
		summary: "Submit bulk organization user enrollment via CSV (async job)",
	})
	@ApiResponse({
		status: 202,
		description: "Job created",
		schema: { properties: { jobId: { type: "string" } } },
	})
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Create, subject: "User" })
	async submitBulkEnrollment(
		@Param("id", ParseUUIDPipe) id: string,
		@UploadedFile(BulkEnrollmentFilePipe) file: Express.Multer.File,
	) {
		const job = await this.orgMembersService.submitBulkEnrollment(id, file);
		return { jobId: job.id };
	}

	@Sse("organizations/:id/members/bulk/jobs/:jobId/stream")
	@Header("X-Accel-Buffering", "no")
	@ApiOperation({ summary: "Stream bulk enrollment job status via SSE" })
	@ApiResponse({ status: 200, description: "SSE stream of job status events" })
	@ApiResponse({ status: 404, description: "Job or organization not found" })
	@Permissions({ action: Action.Read, subject: "BackGroundJob" })
	streamBulkEnrollmentJob(
		@Param("id", ParseUUIDPipe) orgId: string,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	): Observable<MessageEvent> {
		return this.orgMembersService.streamBulkEnrollmentJob(orgId, jobId);
	}

	@Get("organizations/:id/members/bulk/jobs/:jobId")
	@ApiOperation({ summary: "Get bulk enrollment job status" })
	@ApiResponse({ status: 200, description: "Job status and result" })
	@ApiResponse({ status: 404, description: "Job or organization not found" })
	@Permissions({ action: Action.Read, subject: "BackGroundJob" })
	async getBulkEnrollmentJob(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("jobId", ParseUUIDPipe) jobId: string,
	) {
		return this.orgMembersService.getBulkEnrollmentJob(id, jobId);
	}
}

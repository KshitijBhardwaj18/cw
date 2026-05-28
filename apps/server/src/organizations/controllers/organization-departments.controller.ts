import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Session,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateDepartmentDto } from "../dto/create-department.dto";
import { PaginatedDepartmentsQueryDto } from "../dto/paginated-departments.dto";
import { UpdateDepartmentDto } from "../dto/update-department.dto";
import { UpdateDepartmentApproversDto } from "../dto/update-department-approvers.dto";
import { OrgDepartmentsService } from "../services/org-departments.service";

/** Session-scoped `org/departments` and explicit `organizations/:id/departments` routes share one controller. */
@ApiTags("organizations", "organizations (org-context)")
@Controller()
@UseGuards(PermissionsGuard)
export class OrganizationDepartmentsController {
	constructor(private readonly orgDepartmentsService: OrgDepartmentsService) {}

	@Get("org/departments")
	@ApiOperation({ summary: "List departments for the active organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization departments",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Department" })
	async getOrgContextDepartments(
		@Session() session: UserSession,
		@Query() query: PaginatedDepartmentsQueryDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.orgDepartmentsService.findDepartmentsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
			query.locationId,
			query.organizationOccupationId,
			query.organizationSpecialtyId,
		);
	}

	@Get("organizations/:id/departments")
	@ApiOperation({ summary: "List departments for an organization" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of organization departments",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Department" })
	async getOrganizationDepartments(
		@Param("id") organizationId: string,
		@Query() query: PaginatedDepartmentsQueryDto,
		@Session() session: UserSession,
	) {
		return this.orgDepartmentsService.findDepartmentsByOrganizationId(
			organizationId,
			session,
			query.page,
			query.limit,
			query.search,
			query.locationId,
			query.organizationOccupationId,
			query.organizationSpecialtyId,
		);
	}

	@Post("organizations/:id/departments")
	@ApiOperation({ summary: "Add a department to an organization" })
	@ApiResponse({ status: 201, description: "Department created successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({
		status: 404,
		description: "Organization or location not found",
	})
	@Permissions({ action: Action.Create, subject: "Department" })
	async createOrganizationDepartment(
		@Param("id") organizationId: string,
		@Body() dto: CreateDepartmentDto,
		@Session() session: UserSession,
	) {
		return this.orgDepartmentsService.createDepartment(
			organizationId,
			dto,
			session,
		);
	}

	@Get("organizations/:id/departments/:departmentId")
	@ApiOperation({ summary: "Get a single department by ID" })
	@ApiResponse({ status: 200, description: "Department details" })
	@ApiResponse({
		status: 404,
		description: "Organization or department not found",
	})
	@Permissions({ action: Action.Read, subject: "Department" })
	async getOrganizationDepartment(
		@Param("id") organizationId: string,
		@Param("departmentId") departmentId: string,
		@Session() session: UserSession,
	) {
		return this.orgDepartmentsService.findDepartmentById(
			organizationId,
			departmentId,
			session,
		);
	}

	@Put("organizations/:id/departments/:departmentId")
	@ApiOperation({ summary: "Update an organization department" })
	@ApiResponse({ status: 200, description: "Department updated successfully" })
	@ApiResponse({
		status: 404,
		description: "Organization or department not found",
	})
	@Permissions({ action: Action.Update, subject: "Department" })
	async updateOrganizationDepartment(
		@Param("id") organizationId: string,
		@Param("departmentId") departmentId: string,
		@Body() dto: UpdateDepartmentDto,
		@Session() session: UserSession,
	) {
		return this.orgDepartmentsService.updateDepartment(
			organizationId,
			departmentId,
			dto,
			session,
		);
	}

	@Put("organizations/:id/departments/:departmentId/approvers")
	@ApiOperation({ summary: "Update department timekeeping approvers" })
	@ApiResponse({ status: 200, description: "Approvers updated successfully" })
	@ApiResponse({
		status: 404,
		description: "Organization or department not found",
	})
	@Permissions({ action: Action.Update, subject: "Department" })
	async updateOrganizationDepartmentApprovers(
		@Param("id") organizationId: string,
		@Param("departmentId") departmentId: string,
		@Body() dto: UpdateDepartmentApproversDto,
		@Session() session: UserSession,
	) {
		return this.orgDepartmentsService.updateDepartmentTimekeepingApprovers(
			organizationId,
			departmentId,
			dto.userIds,
			session,
		);
	}

	@Delete("organizations/:id/departments/:departmentId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete an organization department" })
	@ApiResponse({ status: 204, description: "Department deleted successfully" })
	@ApiResponse({
		status: 404,
		description: "Organization or department not found",
	})
	@Permissions({ action: Action.Delete, subject: "Department" })
	async deleteOrganizationDepartment(
		@Param("id") organizationId: string,
		@Param("departmentId") departmentId: string,
		@Session() session: UserSession,
	): Promise<void> {
		return this.orgDepartmentsService.deleteDepartment(
			organizationId,
			departmentId,
			session,
		);
	}
}

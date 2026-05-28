import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import {
	OrgCandidatesQueryDto,
	SetCandidateActiveDto,
} from "../dto/organization-candidates.dto";
import { OrganizationCandidatesService } from "../services/organization-candidates.service";

@ApiTags("organizations", "candidates (admin)")
@Controller("organizations/:id/candidates")
@UseGuards(PermissionsGuard)
export class OrganizationCandidatesController {
	constructor(private readonly service: OrganizationCandidatesService) {}

	@Get()
	@ApiOperation({
		summary: "List candidates enrolled in an organization (admin)",
	})
	@ApiResponse({ status: 200, description: "Paginated list of candidates" })
	@Permissions({ action: Action.List, subject: "Candidate" })
	async list(
		@Param("id", ParseUUIDPipe) orgId: string,
		@Query() query: OrgCandidatesQueryDto,
	) {
		return this.service.list(orgId, query);
	}

	@Patch(":candidateId/active")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Activate or deactivate a candidate" })
	@ApiResponse({ status: 200, description: "Updated candidate" })
	@Permissions({ action: Action.Update, subject: "Candidate" })
	async setActive(
		@Param("id", ParseUUIDPipe) orgId: string,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Body() body: SetCandidateActiveDto,
	) {
		return this.service.setActive(orgId, candidateId, body.isActive);
	}

	@Delete(":candidateId")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Delete a candidate (only if no work history)" })
	@ApiResponse({ status: 200, description: "Candidate deleted" })
	@Permissions({ action: Action.Delete, subject: "Candidate" })
	async remove(
		@Param("id", ParseUUIDPipe) orgId: string,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
	) {
		return this.service.remove(orgId, candidateId);
	}
}

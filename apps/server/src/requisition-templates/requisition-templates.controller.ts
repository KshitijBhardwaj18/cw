import {
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
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateRequisitionTemplateDto } from "./dto/create-requisition-template.dto";
import { QueryRequisitionTemplatesDto } from "./dto/query-requisition-templates.dto";
import { UpdateRequisitionTemplateDto } from "./dto/update-requisition-template.dto";
import { RequisitionTemplatesService } from "./requisition-templates.service";

@ApiTags("Requisition Templates")
@Controller("org/requisition-templates")
@UseGuards(PermissionsGuard)
export class RequisitionTemplatesController {
	constructor(private readonly service: RequisitionTemplatesService) {}

	@Get()
	@ApiOperation({ summary: "List requisition templates for an organization" })
	@ApiResponse({ status: 200, description: "Paginated requisition templates" })
	@Permissions({ action: Action.List, subject: "RequisitionTemplate" })
	list(
		@Session() session: UserSession,
		@Query() query: QueryRequisitionTemplatesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.list(orgId, query);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create requisition template" })
	@ApiResponse({ status: 201, description: "Requisition template created" })
	@Permissions({ action: Action.Create, subject: "RequisitionTemplate" })
	create(
		@Session() session: UserSession,
		@Body() dto: CreateRequisitionTemplateDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.create(orgId, dto, session.user.id);
	}

	@Get(":id")
	@Permissions({ action: Action.Read, subject: "RequisitionTemplate" })
	findOne(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.findOne(orgId, id);
	}

	@Patch(":id")
	@Permissions({ action: Action.Update, subject: "RequisitionTemplate" })
	update(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateRequisitionTemplateDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.update(orgId, id, dto, session.user.id);
	}
}

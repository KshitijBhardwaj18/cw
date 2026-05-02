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
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateShiftTemplateDto } from "./dto/create-shift-template.dto";
import { QueryShiftTemplatesDto } from "./dto/query-shift-templates.dto";
import { UpdateBillingDto } from "./dto/update-billing.dto";
import { UpdateShiftTemplateDto } from "./dto/update-shift-template.dto";
import { ShiftTemplatesService } from "./shift-templates.service";

@ApiTags("Shift Templates")
@Controller("org/shift-templates")
@UseGuards(PermissionsGuard)
export class ShiftTemplatesController {
	constructor(private readonly service: ShiftTemplatesService) {}

	@Get()
	@ApiOperation({ summary: "List shift templates for an organization" })
	@Permissions({ action: Action.List, subject: "ShiftTemplate" })
	list(
		@Session() session: UserSession,
		@Query() query: QueryShiftTemplatesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.list(orgId, query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single shift template" })
	@Permissions({ action: Action.Read, subject: "ShiftTemplate" })
	findOne(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.findOne(orgId, id);
	}

	@Post()
	@ApiOperation({ summary: "Create a shift template" })
	@HttpCode(HttpStatus.CREATED)
	@Permissions({ action: Action.Create, subject: "ShiftTemplate" })
	create(
		@Session() session: UserSession,
		@Body() dto: CreateShiftTemplateDto,
		@Session() { user }: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.create(orgId, dto, user.id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a shift template" })
	@Permissions({ action: Action.Update, subject: "ShiftTemplate" })
	update(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateShiftTemplateDto,
		@Session() { user }: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.update(orgId, id, dto, user.id);
	}

	@Patch(":id/billing")
	@ApiOperation({
		summary: "Update billing configuration for a shift template",
	})
	@Permissions({ action: Action.Update, subject: "ShiftTemplate" })
	updateBilling(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateBillingDto,
		@Session() { user }: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.updateBilling(orgId, id, dto, user.id);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a shift template" })
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Delete, subject: "ShiftTemplate" })
	remove(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.remove(orgId, id);
	}
}

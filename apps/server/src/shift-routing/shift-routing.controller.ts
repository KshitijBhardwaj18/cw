import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { PatchTierDto } from "./dto/patch-tier.dto";
import { SyncTiersDto } from "./dto/sync-tiers.dto";
import { UpdateRoutingSettingsDto } from "./dto/update-routing-settings.dto";
import { ShiftRoutingService } from "./shift-routing.service";

@ApiTags("Shift Routing")
@Controller("org/shift-routing")
@UseGuards(PermissionsGuard)
export class ShiftRoutingController {
	constructor(private readonly service: ShiftRoutingService) {}

	@Get()
	@ApiOperation({
		summary: "Get routing settings and tiers for an organization",
	})
	@Permissions({ action: Action.Read, subject: "ShiftRoutingSettings" })
	getSettings(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.getSettings(orgId);
	}

	@Patch("delay")
	@ApiOperation({ summary: "Update routing delay settings" })
	@Permissions({ action: Action.Update, subject: "ShiftRoutingSettings" })
	updateSettings(
		@Session() session: UserSession,
		@Body() dto: UpdateRoutingSettingsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.updateSettings(orgId, dto);
	}

	@Put("tiers")
	@ApiOperation({
		summary: "Sync all routing tiers (reorder and toggle active)",
	})
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Update, subject: "ShiftRoutingSettings" })
	syncTiers(@Session() session: UserSession, @Body() dto: SyncTiersDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.syncTiers(orgId, dto);
	}

	@Patch("tiers/:tierId")
	@ApiOperation({ summary: "Patch a single routing tier" })
	@Permissions({ action: Action.Update, subject: "ShiftRoutingSettings" })
	patchTier(
		@Session() session: UserSession,
		@Param("tierId", ParseUUIDPipe) tierId: string,
		@Body() dto: PatchTierDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.patchTier(orgId, tierId, dto);
	}
}

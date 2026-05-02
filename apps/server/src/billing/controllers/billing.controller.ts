import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreatePayCodeDto } from "../dto/create-pay-code.dto";
import { QueryPayCodesDto } from "../dto/query-pay-codes.dto";
import { UpdateBillingConfigDto } from "../dto/update-billing-config.dto";
import { UpdatePayCodeDto } from "../dto/update-pay-code.dto";
import { UpdateWorkforceBillingRateDto } from "../dto/update-workforce-billing-rate.dto";
import { BillingService } from "../services/billing.service";

@ApiTags("Billing")
@Controller("org/billing")
@UseGuards(PermissionsGuard)
export class BillingController {
	constructor(private readonly billingService: BillingService) {}

	@Get("pay-codes/stats")
	@ApiOperation({ summary: "Pay code aggregate counts" })
	@Permissions({ action: Action.Read, subject: "OrganizationPayCode" })
	getPayCodeStats(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.getPayCodeStats(orgId);
	}

	@Get("pay-codes")
	@ApiOperation({ summary: "List pay codes (paginated)" })
	@Permissions({ action: Action.List, subject: "OrganizationPayCode" })
	listPayCodes(
		@Session() session: UserSession,
		@Query() query: QueryPayCodesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.listPayCodes(orgId, query);
	}

	@Post("pay-codes")
	@ApiOperation({ summary: "Create a pay code" })
	@Permissions({ action: Action.Create, subject: "OrganizationPayCode" })
	createPayCode(
		@Session() session: UserSession,
		@Body() dto: CreatePayCodeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.createPayCode(orgId, dto);
	}

	@Delete("pay-codes/:payCodeId")
	@ApiOperation({ summary: "Delete a pay code" })
	@Permissions({ action: Action.Delete, subject: "OrganizationPayCode" })
	deletePayCode(
		@Session() session: UserSession,
		@Param("payCodeId", ParseUUIDPipe) payCodeId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.deletePayCode(orgId, payCodeId);
	}

	@Patch("pay-codes/:payCodeId")
	@ApiOperation({ summary: "Update a pay code" })
	@Permissions({ action: Action.Update, subject: "OrganizationPayCode" })
	updatePayCode(
		@Session() session: UserSession,
		@Param("payCodeId", ParseUUIDPipe) payCodeId: string,
		@Body() dto: UpdatePayCodeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.updatePayCode(orgId, payCodeId, dto);
	}

	@Get("config")
	@ApiOperation({ summary: "Get billing config (upserts on first access)" })
	@Permissions({ action: Action.List, subject: "BillingConfig" })
	getConfig(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.getConfig(orgId);
	}

	@Put("config")
	@ApiOperation({ summary: "Update billing config" })
	@Permissions({ action: Action.Update, subject: "BillingConfig" })
	updateConfig(
		@Session() session: UserSession,
		@Body() dto: UpdateBillingConfigDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.updateConfig(orgId, dto);
	}

	@Get("workforce-rates")
	@ApiOperation({
		summary: "List per–workforce-type billing rates (tech fee, fee type)",
	})
	@Permissions({
		action: Action.List,
		subject: "OrganizationWorkforceBillingRate",
	})
	listWorkforceBillingRates(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.listWorkforceBillingRates(orgId);
	}

	@Patch("workforce-rates/:rateId")
	@ApiOperation({ summary: "Update a workforce billing rate row" })
	@Permissions({
		action: Action.Update,
		subject: "OrganizationWorkforceBillingRate",
	})
	updateWorkforceBillingRate(
		@Session() session: UserSession,
		@Param("rateId", ParseUUIDPipe) rateId: string,
		@Body() dto: UpdateWorkforceBillingRateDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.billingService.updateWorkforceBillingRate(orgId, rateId, dto);
	}
}

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
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreatePayCodeDto } from "../dto/create-pay-code.dto";
import { QueryPayCodesDto } from "../dto/query-pay-codes.dto";
import { UpdateBillingConfigDto } from "../dto/update-billing-config.dto";
import { UpdatePayCodeDto } from "../dto/update-pay-code.dto";
import { UpdateWorkforceBillingRateDto } from "../dto/update-workforce-billing-rate.dto";
import { BillingService } from "../services/billing.service";

/**
 * Admin / explicit-org routes: same behavior as `org/billing/*` but `organizationId` comes from the path.
 */
@ApiTags("Billing")
@Controller("organizations/:organizationId/billing")
@UseGuards(PermissionsGuard)
export class OrganizationBillingController {
	constructor(private readonly billingService: BillingService) {}

	@Get("pay-codes/stats")
	@ApiOperation({
		summary: "Pay code aggregate counts (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "OrganizationPayCode" })
	getPayCodeStats(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.billingService.getPayCodeStats(organizationId);
	}

	@Get("pay-codes")
	@ApiOperation({ summary: "List pay codes (paginated)" })
	@Permissions({ action: Action.List, subject: "OrganizationPayCode" })
	listPayCodes(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryPayCodesDto,
	) {
		return this.billingService.listPayCodes(organizationId, query);
	}

	@Post("pay-codes")
	@ApiOperation({ summary: "Create a pay code" })
	@Permissions({ action: Action.Create, subject: "OrganizationPayCode" })
	createPayCode(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: CreatePayCodeDto,
	) {
		return this.billingService.createPayCode(organizationId, dto);
	}

	@Delete("pay-codes/:payCodeId")
	@ApiOperation({ summary: "Delete a pay code" })
	@Permissions({ action: Action.Delete, subject: "OrganizationPayCode" })
	deletePayCode(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("payCodeId", ParseUUIDPipe) payCodeId: string,
	) {
		return this.billingService.deletePayCode(organizationId, payCodeId);
	}

	@Patch("pay-codes/:payCodeId")
	@ApiOperation({ summary: "Update a pay code" })
	@Permissions({ action: Action.Update, subject: "OrganizationPayCode" })
	updatePayCode(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("payCodeId", ParseUUIDPipe) payCodeId: string,
		@Body() dto: UpdatePayCodeDto,
	) {
		return this.billingService.updatePayCode(organizationId, payCodeId, dto);
	}

	@Get("config")
	@ApiOperation({ summary: "Get billing config (explicit organization id)" })
	@Permissions({ action: Action.List, subject: "BillingConfig" })
	getConfig(@Param("organizationId", ParseUUIDPipe) organizationId: string) {
		return this.billingService.getConfig(organizationId);
	}

	@Put("config")
	@ApiOperation({ summary: "Update billing config (explicit organization id)" })
	@Permissions({ action: Action.Update, subject: "BillingConfig" })
	updateConfig(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: UpdateBillingConfigDto,
	) {
		return this.billingService.updateConfig(organizationId, dto);
	}

	@Post("config/test/run-cycle-now")
	@ApiOperation({
		summary:
			"Test: enqueue billing cycle run immediately (explicit organization id)",
	})
	@Permissions({ action: Action.Update, subject: "Billing" })
	triggerBillingCycleRunNow(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.billingService.triggerBillingCycleRunNow(organizationId);
	}

	@Get("workforce-rates")
	@ApiOperation({
		summary: "List per–workforce-type billing rates (explicit organization id)",
	})
	@Permissions({
		action: Action.List,
		subject: "OrganizationWorkforceBillingRate",
	})
	listWorkforceBillingRates(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.billingService.listWorkforceBillingRates(organizationId);
	}

	@Patch("workforce-rates/:rateId")
	@ApiOperation({
		summary: "Update a workforce billing rate row (explicit organization id)",
	})
	@Permissions({
		action: Action.Update,
		subject: "OrganizationWorkforceBillingRate",
	})
	updateWorkforceBillingRate(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("rateId", ParseUUIDPipe) rateId: string,
		@Body() dto: UpdateWorkforceBillingRateDto,
	) {
		return this.billingService.updateWorkforceBillingRate(
			organizationId,
			rateId,
			dto,
		);
	}
}

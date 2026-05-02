import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Res,
	StreamableFile,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { requireVendorPortalActor } from "src/common/utils/resolve-vendor-actor";
import { ApproveInvoiceDto } from "../dto/approve-invoice.dto";
import { QueryInvoicesDto } from "../dto/query-invoices.dto";
import { ReviewInvoiceDto } from "../dto/review-invoice.dto";
import { RouteInvoiceApprovalDto } from "../dto/route-invoice-approval.dto";
import { UpdateInvoiceStatusDto } from "../dto/update-invoice-status.dto";
import { BillingInvoicesService } from "../services/billing-invoices.service";

@ApiTags("Billing — Invoices")
@Controller("org/billing")
@UseGuards(PermissionsGuard)
export class BillingInvoicesController {
	constructor(private readonly invoicesService: BillingInvoicesService) {}

	@Get("invoices/pending-count")
	@ApiOperation({ summary: "Count of pending invoices (DRAFT + SUBMITTED)" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getPendingInvoiceCount(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.getPendingInvoiceCount(orgId);
	}

	@Get("invoices/history/pending-count")
	@ApiOperation({ summary: "Pending routed invoice count for current user" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getInvoiceHistoryPendingCount(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.getInvoiceHistoryPendingCount(
			orgId,
			session.user.id,
		);
	}

	@Get("invoices")
	@ApiOperation({ summary: "List invoices (paginated, searchable)" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoices(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.listInvoices(orgId, dto);
	}

	@Get("invoices/history")
	@ApiOperation({
		summary:
			"Invoice history for current user (server-side routed-to-me filter)",
	})
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoiceHistory(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.listInvoiceHistory(orgId, session.user.id, dto);
	}

	@Get("invoices/final")
	@ApiOperation({ summary: "List final invoices (paginated)" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	listFinalInvoices(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.listFinalInvoices(orgId, dto);
	}

	@Get("invoices/final-summary")
	@ApiOperation({ summary: "Final invoice cards summary" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getFinalInvoiceSummary(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.getFinalInvoiceSummary(orgId, dto);
	}

	@Get("invoices/approvers")
	@ApiOperation({ summary: "Eligible invoice approvers list" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoiceApprovers(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.listInvoiceApprovers(orgId);
	}

	@Get("invoices/draft-summary")
	@ApiOperation({ summary: "Draft invoice summary (unpaginated aggregate)" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	getInvoiceDraftSummary(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.getInvoiceDraftSummary(orgId, dto);
	}

	@Get("invoices/:invoiceId")
	@ApiOperation({
		summary: "Get invoice detail with line items and workflow actors",
	})
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getInvoice(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.getInvoice(orgId, invoiceId);
	}

	@Post("invoices/:invoiceId/submit")
	@ApiOperation({ summary: "Submit draft invoice for review" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	submit(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.submit(orgId, invoiceId, session.user.id);
	}

	@Post("invoices/:invoiceId/review")
	@ApiOperation({ summary: "Record review on a submitted invoice" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	review(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: ReviewInvoiceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.review(orgId, invoiceId, session.user.id, dto);
	}

	@Post("invoices/:invoiceId/approve")
	@ApiOperation({ summary: "Approve submitted invoice" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	approve(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: ApproveInvoiceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.approve(orgId, invoiceId, session.user.id, dto);
	}

	@Post("invoices/:invoiceId/route-approval")
	@ApiOperation({ summary: "Route invoice to selected approver" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	routeForApproval(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: RouteInvoiceApprovalDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.routeForApproval(
			orgId,
			invoiceId,
			session.user.id,
			dto,
		);
	}

	@Get("invoices/:invoiceId/download-csv")
	@ApiOperation({ summary: "Download invoice CSV" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadInvoiceCsv(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const orgId = requireActiveOrganizationId(session);
		const { filename, csv } = await this.invoicesService.buildInvoiceCsv(
			orgId,
			invoiceId,
		);
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(Buffer.from(csv, "utf-8"));
	}

	@Get("invoices/:invoiceId/download-pdf")
	@ApiOperation({ summary: "Download invoice PDF" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadInvoicePdf(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const orgId = requireActiveOrganizationId(session);
		const { filename, pdf } = await this.invoicesService.buildInvoicePdf(
			orgId,
			invoiceId,
		);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(pdf);
	}

	@Get("vendor/invoices")
	@ApiOperation({
		summary: "Vendor portal: list invoices for signed-in vendor",
	})
	@Permissions({ action: Action.List, subject: "Invoice" })
	listVendorInvoices(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.invoicesService.listVendorInvoices(orgId, actor.vendorId, dto);
	}

	@Get("vendor/invoices/summary")
	@ApiOperation({ summary: "Vendor portal: invoice summary cards" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	getVendorInvoiceSummary(
		@Session() session: UserSession,
		@Query() dto: QueryInvoicesDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.invoicesService.getVendorInvoiceSummary(
			orgId,
			actor.vendorId,
			dto,
		);
	}

	@Get("vendor/invoices/:invoiceId/breakdown")
	@ApiOperation({ summary: "Vendor portal: invoice calculation breakdown" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getVendorInvoiceBreakdown(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return this.invoicesService.getVendorInvoiceBreakdown(
			orgId,
			actor.vendorId,
			invoiceId,
		);
	}

	@Get("vendor/invoices/:invoiceId/download-csv")
	@ApiOperation({ summary: "Vendor portal: download invoice CSV" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadVendorInvoiceCsv(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		await this.invoicesService.getVendorInvoiceBreakdown(
			orgId,
			actor.vendorId,
			invoiceId,
		);
		const { filename, csv } = await this.invoicesService.buildInvoiceCsv(
			orgId,
			invoiceId,
		);
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(Buffer.from(csv, "utf-8"));
	}

	@Get("vendor/invoices/:invoiceId/download-pdf")
	@ApiOperation({ summary: "Vendor portal: download invoice PDF" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadVendorInvoicePdf(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const orgId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		await this.invoicesService.getVendorInvoiceBreakdown(
			orgId,
			actor.vendorId,
			invoiceId,
		);
		const { filename, pdf } = await this.invoicesService.buildInvoicePdf(
			orgId,
			invoiceId,
		);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(pdf);
	}

	@Patch("invoices/:invoiceId/status")
	@ApiOperation({
		summary: "Update invoice status (allowed transitions only)",
	})
	@Permissions({ action: Action.Update, subject: "Invoice" })
	updateInvoiceStatus(
		@Session() session: UserSession,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: UpdateInvoiceStatusDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.invoicesService.updateInvoiceStatus(
			orgId,
			invoiceId,
			dto.status,
		);
	}
}

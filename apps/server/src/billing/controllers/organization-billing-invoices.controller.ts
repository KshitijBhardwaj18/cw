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
import { ApproveInvoiceDto } from "../dto/approve-invoice.dto";
import { QueryInvoicesDto } from "../dto/query-invoices.dto";
import { ReviewInvoiceDto } from "../dto/review-invoice.dto";
import { RouteInvoiceApprovalDto } from "../dto/route-invoice-approval.dto";
import { UpdateInvoiceStatusDto } from "../dto/update-invoice-status.dto";
import { BillingInvoicesService } from "../services/billing-invoices.service";

/**
 * Same invoice routes as `org/billing/*` with explicit `organizationId` in the path.
 */
@ApiTags("Billing — Invoices")
@Controller("organizations/:organizationId/billing")
@UseGuards(PermissionsGuard)
export class OrganizationBillingInvoicesController {
	constructor(private readonly invoicesService: BillingInvoicesService) {}

	@Get("invoices/pending-count")
	@ApiOperation({ summary: "Pending invoice count (explicit organization id)" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getPendingInvoiceCount(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.invoicesService.getPendingInvoiceCount(organizationId);
	}

	@Get("invoices/history/pending-count")
	@ApiOperation({
		summary:
			"Pending routed invoice count for current user (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getInvoiceHistoryPendingCount(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.invoicesService.getInvoiceHistoryPendingCount(
			organizationId,
			session.user.id,
		);
	}

	@Get("invoices")
	@ApiOperation({ summary: "List invoices (explicit organization id)" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoices(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() dto: QueryInvoicesDto,
	) {
		return this.invoicesService.listInvoices(organizationId, dto);
	}

	@Get("invoices/history")
	@ApiOperation({
		summary:
			"Invoice history for current user (server-side routed-to-me filter, explicit organization id)",
	})
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoiceHistory(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() dto: QueryInvoicesDto,
	) {
		return this.invoicesService.listInvoiceHistory(
			organizationId,
			session.user.id,
			dto,
		);
	}

	@Get("invoices/final")
	@ApiOperation({ summary: "List final invoices (explicit organization id)" })
	@Permissions({ action: Action.List, subject: "Invoice" })
	listFinalInvoices(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() dto: QueryInvoicesDto,
	) {
		return this.invoicesService.listFinalInvoices(organizationId, dto);
	}

	@Get("invoices/final-summary")
	@ApiOperation({
		summary: "Final invoice cards summary (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getFinalInvoiceSummary(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() dto: QueryInvoicesDto,
	) {
		return this.invoicesService.getFinalInvoiceSummary(organizationId, dto);
	}

	@Get("invoices/approvers")
	@ApiOperation({
		summary: "Eligible invoice approvers (explicit organization id)",
	})
	@Permissions({ action: Action.List, subject: "Invoice" })
	listInvoiceApprovers(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
	) {
		return this.invoicesService.listInvoiceApprovers(organizationId);
	}

	@Get("invoices/:invoiceId")
	@ApiOperation({ summary: "Get invoice detail (explicit organization id)" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	getInvoice(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
	) {
		return this.invoicesService.getInvoice(organizationId, invoiceId);
	}

	@Post("invoices/:invoiceId/submit")
	@ApiOperation({ summary: "Submit draft invoice (explicit organization id)" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	submit(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
	) {
		return this.invoicesService.submit(
			organizationId,
			invoiceId,
			session.user.id,
		);
	}

	@Post("invoices/:invoiceId/review")
	@ApiOperation({
		summary: "Review submitted invoice (explicit organization id)",
	})
	@Permissions({ action: Action.Update, subject: "Invoice" })
	review(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: ReviewInvoiceDto,
	) {
		return this.invoicesService.review(
			organizationId,
			invoiceId,
			session.user.id,
			dto,
		);
	}

	@Post("invoices/:invoiceId/approve")
	@ApiOperation({ summary: "Approve invoice (explicit organization id)" })
	@Permissions({ action: Action.Update, subject: "Invoice" })
	approve(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: ApproveInvoiceDto,
	) {
		return this.invoicesService.approve(
			organizationId,
			invoiceId,
			session.user.id,
			dto,
		);
	}

	@Post("invoices/:invoiceId/route-approval")
	@ApiOperation({
		summary: "Route invoice to selected approver (explicit organization id)",
	})
	@Permissions({ action: Action.Update, subject: "Invoice" })
	routeForApproval(
		@Session() session: UserSession,
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: RouteInvoiceApprovalDto,
	) {
		return this.invoicesService.routeForApproval(
			organizationId,
			invoiceId,
			session.user.id,
			dto,
		);
	}

	@Get("invoices/:invoiceId/download-csv")
	@ApiOperation({ summary: "Download invoice CSV (explicit organization id)" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadInvoiceCsv(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const { filename, csv } = await this.invoicesService.buildInvoiceCsv(
			organizationId,
			invoiceId,
		);
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(Buffer.from(csv, "utf-8"));
	}

	@Get("invoices/:invoiceId/download-pdf")
	@ApiOperation({ summary: "Download invoice PDF (explicit organization id)" })
	@Permissions({ action: Action.Read, subject: "Invoice" })
	async downloadInvoicePdf(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const { filename, pdf } = await this.invoicesService.buildInvoicePdf(
			organizationId,
			invoiceId,
		);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return new StreamableFile(pdf);
	}

	@Patch("invoices/:invoiceId/status")
	@ApiOperation({
		summary: "Update invoice status (explicit organization id)",
	})
	@Permissions({ action: Action.Update, subject: "Invoice" })
	updateInvoiceStatus(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("invoiceId", ParseUUIDPipe) invoiceId: string,
		@Body() dto: UpdateInvoiceStatusDto,
	) {
		return this.invoicesService.updateInvoiceStatus(
			organizationId,
			invoiceId,
			dto.status,
		);
	}
}

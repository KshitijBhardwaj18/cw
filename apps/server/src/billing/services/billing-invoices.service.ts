import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	InvoiceStatus,
	OrganizationMemberStatus,
	Prisma,
	UserRole,
} from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";

import PDFDocument = require("pdfkit");

import { PrismaService } from "src/prisma/prisma.service";
import type { ApproveInvoiceDto } from "../dto/approve-invoice.dto";
import type { MarkInvoicePaidDto } from "../dto/mark-invoice-paid.dto";
import type { QueryInvoicesDto } from "../dto/query-invoices.dto";
import type { ReviewInvoiceDto } from "../dto/review-invoice.dto";

const STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
	[InvoiceStatus.DRAFT]: [InvoiceStatus.SUBMITTED, InvoiceStatus.CANCELLED],
	[InvoiceStatus.SUBMITTED]: [
		InvoiceStatus.APPROVED,
		InvoiceStatus.DISPUTED,
		InvoiceStatus.CANCELLED,
	],
	[InvoiceStatus.DISPUTED]: [
		InvoiceStatus.SUBMITTED,
		InvoiceStatus.APPROVED,
		InvoiceStatus.CANCELLED,
	],
	[InvoiceStatus.APPROVED]: [
		InvoiceStatus.PAID,
		InvoiceStatus.OVERDUE,
		InvoiceStatus.CANCELLED,
	],
	[InvoiceStatus.SENT]: [
		InvoiceStatus.PAID,
		InvoiceStatus.OVERDUE,
		InvoiceStatus.CANCELLED,
	],
	[InvoiceStatus.PAID]: [InvoiceStatus.CANCELLED],
	[InvoiceStatus.OVERDUE]: [
		InvoiceStatus.DISPUTED,
		InvoiceStatus.PAID,
		InvoiceStatus.CANCELLED,
	],
	[InvoiceStatus.CANCELLED]: [],
};

const invoiceActorSelect = {
	id: true,
	name: true,
	email: true,
} satisfies Prisma.UserSelect;

const invoiceDetailInclude = {
	lineItems: { orderBy: { createdAt: "asc" as const } },
	vendor: { select: { id: true, name: true, internalId: true } },
	submittedBy: { select: invoiceActorSelect },
	reviewedBy: { select: invoiceActorSelect },
	approvedBy: { select: invoiceActorSelect },
} satisfies Prisma.InvoiceInclude;

type FinalInvoiceUiStatus = "PAID" | "PENDING_PAYMENT" | "OVERDUE";
type VendorInvoiceUiStatus = "paid" | "submitted" | "draft";

type VendorDeductionLine = { label: string; percent: number };

@Injectable()
export class BillingInvoicesService {
	constructor(private readonly prisma: PrismaService) {}

	private mapVendorInvoiceStatus(status: InvoiceStatus): VendorInvoiceUiStatus {
		if (status === InvoiceStatus.PAID) return "paid";
		if (status === InvoiceStatus.DRAFT) return "draft";
		return "submitted";
	}

	private async getVendorDeductionTemplate(orgId: string): Promise<{
		lines: VendorDeductionLine[];
		totalPercent: number;
	}> {
		const cfg = await this.prisma.billingConfig.findFirst({
			where: { organizationId: orgId },
			select: { mspPercent: true, saasPercent: true },
		});
		const mspPercent = Number(cfg?.mspPercent ?? 0);
		const saasPercent = Number(cfg?.saasPercent ?? 0);
		const lines: VendorDeductionLine[] = [];
		if (mspPercent > 0) lines.push({ label: "MSP Fee", percent: mspPercent });
		if (saasPercent > 0)
			lines.push({ label: "Tech Fee", percent: saasPercent });
		return {
			lines,
			totalPercent: lines.reduce((sum, l) => sum + l.percent, 0),
		};
	}

	private computeVendorBreakdown(
		finalAmount: number,
		hours: number,
		template: { lines: VendorDeductionLine[]; totalPercent: number },
	) {
		const ratio = 1 - template.totalPercent / 100;
		const grossAmount = ratio > 0 ? finalAmount / ratio : finalAmount;
		const deductionLines = template.lines.map((l) => ({
			label: l.label,
			percent: l.percent,
			amount: (grossAmount * l.percent) / 100,
		}));
		const totalDeductions = deductionLines.reduce(
			(sum, l) => sum + l.amount,
			0,
		);
		const billRate = hours > 0 ? finalAmount / hours : 0;
		const multiplier =
			billRate > 0 && hours > 0
				? Number((finalAmount / (billRate * hours)).toFixed(4))
				: 0;
		return {
			billRate,
			hours,
			multiplier,
			grossAmount,
			deductionLines,
			totalDeductions,
			finalAmount,
		};
	}

	private formatVendorPeriodLabel(
		startDate: Date | null | undefined,
		endDate: Date | null | undefined,
	): string {
		const safeStart = startDate ?? endDate;
		const safeEnd = endDate ?? startDate;
		if (!safeStart || !safeEnd) return "N/A";
		return `${safeStart.toISOString()} - ${safeEnd.toISOString()}`;
	}

	private roundHours(value: number): number {
		return Math.round(Number(value || 0) * 100) / 100;
	}

	private formatVendorDate(date: Date | null | undefined): string {
		if (!date) return "N/A";
		return date.toISOString();
	}

	private async getInvoiceOpenDisputedAmount(
		invoiceId: string,
	): Promise<number> {
		const rows = await this.prisma.$queryRaw<Array<{ disputedAmount: number }>>(
			Prisma.sql`
				WITH disputes_by_timesheet AS (
					SELECT
						td."timesheetId" AS "timesheetId",
						COUNT(*)::int AS open_disputes,
						SUM(COALESCE(td."disputedAmount", 0))::float8 AS disputed_amount
					FROM "timesheet_disputes" td
					WHERE td."resolvedAt" IS NULL
					GROUP BY td."timesheetId"
				)
				SELECT
					COALESCE(SUM(
						CASE
							WHEN COALESCE(dbt.open_disputes, 0) > 0
								THEN COALESCE(NULLIF(dbt.disputed_amount, 0), ili."amount", 0)::float8
							ELSE 0::float8
						END
					), 0)::float8 AS "disputedAmount"
				FROM "invoice_line_items" ili
				LEFT JOIN disputes_by_timesheet dbt
					ON dbt."timesheetId" = ili."timesheetId"
				WHERE ili."invoiceId" = ${invoiceId}::uuid
			`,
		);
		return Number(rows[0]?.disputedAmount ?? 0);
	}

	async submit(orgId: string, invoiceId: string, userId: string) {
		const existing = await this.requireInvoice(orgId, invoiceId);
		if (existing.status !== InvoiceStatus.DRAFT) {
			throw new BadRequestException("Only draft invoices can be submitted.");
		}
		if (existing.lineItems.length === 0) {
			throw new BadRequestException(
				"Add at least one line item before submitting",
			);
		}

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				status: InvoiceStatus.SUBMITTED,
				submittedById: userId,
				submittedAt: new Date(),
			},
			include: invoiceDetailInclude,
		});
	}

	async review(
		orgId: string,
		invoiceId: string,
		userId: string,
		dto: ReviewInvoiceDto,
	) {
		const existing = await this.requireInvoice(orgId, invoiceId);
		if (existing.status !== InvoiceStatus.SUBMITTED) {
			throw new BadRequestException("Only submitted invoices can be reviewed.");
		}

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				reviewedById: userId,
				reviewedAt: new Date(),
				...(dto.reviewNotes !== undefined
					? { reviewNotes: dto.reviewNotes }
					: {}),
			},
			include: invoiceDetailInclude,
		});
	}

	async approve(
		orgId: string,
		invoiceId: string,
		userId: string,
		dto: ApproveInvoiceDto,
	) {
		const existing = await this.requireInvoice(orgId, invoiceId);
		if (existing.status !== InvoiceStatus.SUBMITTED) {
			throw new BadRequestException("Only submitted invoices can be approved.");
		}

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				status: InvoiceStatus.APPROVED,
				approvedById: userId,
				approvedAt: new Date(),
				...(dto.approvalNotes !== undefined
					? { approvalNotes: dto.approvalNotes }
					: {}),
			},
			include: invoiceDetailInclude,
		});
	}

	async markSent(orgId: string, invoiceId: string) {
		const existing = await this.requireInvoice(orgId, invoiceId);
		if (existing.status !== InvoiceStatus.APPROVED) {
			throw new BadRequestException(
				"Only approved invoices can be marked as sent",
			);
		}

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				status: InvoiceStatus.SENT,
				sentToClientAt: new Date(),
			},
			include: invoiceDetailInclude,
		});
	}

	async markPaid(orgId: string, invoiceId: string, dto: MarkInvoicePaidDto) {
		const existing = await this.requireInvoice(orgId, invoiceId);
		if (
			existing.status !== InvoiceStatus.SENT &&
			existing.status !== InvoiceStatus.OVERDUE
		) {
			throw new BadRequestException(
				"Only sent or overdue invoices can be marked as paid",
			);
		}

		const paid = dto.amountPaid ?? existing.totalAmount;

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				status: InvoiceStatus.PAID,
				paidDate: new Date(dto.paidDate),
				amountPaid: paid,
				...(dto.paymentMethod !== undefined
					? { paymentMethod: dto.paymentMethod }
					: {}),
				...(dto.paymentReference !== undefined
					? { paymentReference: dto.paymentReference }
					: {}),
			},
			include: invoiceDetailInclude,
		});
	}

	private async requireInvoice(orgId: string, invoiceId: string) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, organizationId: orgId },
			include: {
				lineItems: { orderBy: { createdAt: "asc" } },
			},
		});
		if (!invoice) throw new NotFoundException("Invoice not found.");
		return invoice;
	}

	async listInvoices(orgId: string, dto: QueryInvoicesDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const useAll = dto.all === true;

		const rawStatus = dto.status?.trim();
		const isPendingStatuses = rawStatus?.toUpperCase() === "PENDING";

		const statusValue =
			!isPendingStatuses &&
			rawStatus &&
			rawStatus !== "all" &&
			rawStatus !== "ALL"
				? (rawStatus as InvoiceStatus)
				: undefined;

		const where = {
			organizationId: orgId,
			...(isPendingStatuses && {
				status: InvoiceStatus.SUBMITTED,
			}),
			...(!isPendingStatuses && statusValue && { status: statusValue }),
			...(dto.search && {
				invoiceNumber: { contains: dto.search, mode: "insensitive" as const },
			}),
			...(dto.vendorId && { vendorId: dto.vendorId }),
		};

		const invoices = await this.prisma.invoice.findMany({
			where,
			select: {
				id: true,
				invoiceNumber: true,
				invoiceDate: true,
				dueDate: true,
				periodStartDate: true,
				periodEndDate: true,
				totalAmount: true,
				status: true,
				routedToUserId: true,
				vendorId: true,
				vendor: { select: { id: true, name: true } },
				_count: { select: { lineItems: true } },
			},
			orderBy: { invoiceDate: "desc" },
		});

		const invoiceIds = invoices.map((inv) => inv.id);
		const rollups =
			invoiceIds.length > 0
				? await this.prisma.$queryRaw<
						Array<{
							invoiceId: string;
							workersCount: number;
							totalHours: number;
							disputedAmount: number;
							disputedLineItemCount: number;
							departmentCount: number;
							projectCount: number;
							projectName: string | null;
							projectId: string | null;
						}>
					>(Prisma.sql`
						WITH disputes_by_timesheet AS (
							SELECT
								td."timesheetId" AS "timesheetId",
								COUNT(*)::int AS open_disputes,
								SUM(COALESCE(td."disputedAmount", 0))::float8 AS disputed_amount
							FROM "timesheet_disputes" td
							WHERE td."resolvedAt" IS NULL
							GROUP BY td."timesheetId"
						)
						SELECT
							ili."invoiceId" AS "invoiceId",
							COUNT(DISTINCT ili."candidateId") FILTER (
								WHERE ili."candidateId" IS NOT NULL
							)::int AS "workersCount",
							COALESCE(SUM(ili."quantity"), 0)::float8 AS "totalHours",
							COALESCE(SUM(
								CASE
									WHEN COALESCE(dbt.open_disputes, 0) > 0
										THEN COALESCE(NULLIF(dbt.disputed_amount, 0), ili."amount", 0)::float8
									ELSE 0::float8
								END
							), 0)::float8 AS "disputedAmount",
							COUNT(*) FILTER (
								WHERE COALESCE(dbt.open_disputes, 0) > 0
							)::int AS "disputedLineItemCount",
							COUNT(DISTINCT COALESCE(ts."departmentId", rq."departmentId")) FILTER (
								WHERE COALESCE(ts."departmentId", rq."departmentId") IS NOT NULL
							)::int AS "departmentCount",
							COUNT(DISTINCT pj."id") FILTER (
								WHERE pj."id" IS NOT NULL
							)::int AS "projectCount",
							MIN(pj."name")::text AS "projectName",
							MIN(pj."id"::text) AS "projectId"
						FROM "invoice_line_items" ili
						LEFT JOIN disputes_by_timesheet dbt
							ON dbt."timesheetId" = ili."timesheetId"
						LEFT JOIN "timesheet" ts ON ts."id" = ili."timesheetId"
						LEFT JOIN "placement" pl ON pl."id" = ili."placementId"
						LEFT JOIN "requisition" rq ON rq."id" = pl."requisitionId"
						LEFT JOIN "project" pj ON pj."id" = rq."projectId"
						WHERE ili."invoiceId" IN (${Prisma.join(invoiceIds.map((id) => Prisma.sql`${id}::uuid`))})
						GROUP BY ili."invoiceId"
					`)
				: [];
		const rollupByInvoiceId = new Map(rollups.map((r) => [r.invoiceId, r]));

		const rolledData = invoices.map((inv) => {
			const disputedAmount = rollupByInvoiceId.get(inv.id)?.disputedAmount ?? 0;
			const adjustedTotalAmount = Math.max(
				0,
				Number(inv.totalAmount ?? 0) - Number(disputedAmount ?? 0),
			);
			return {
				...inv,
				totalAmount: adjustedTotalAmount,
				lineItemCount: inv._count.lineItems,
				workersCount: rollupByInvoiceId.get(inv.id)?.workersCount ?? 0,
				totalHours: this.roundHours(
					rollupByInvoiceId.get(inv.id)?.totalHours ?? 0,
				),
				disputedAmount,
				disputedLineItemCount:
					rollupByInvoiceId.get(inv.id)?.disputedLineItemCount ?? 0,
				departmentCount: rollupByInvoiceId.get(inv.id)?.departmentCount ?? 0,
				projectCount: rollupByInvoiceId.get(inv.id)?.projectCount ?? 0,
				projectName: rollupByInvoiceId.get(inv.id)?.projectName ?? null,
				projectId: rollupByInvoiceId.get(inv.id)?.projectId ?? null,
				_count: undefined,
			};
		});

		const projectFiltered = dto.projectId
			? rolledData.filter((row) => row.projectId === dto.projectId)
			: rolledData;

		const total = projectFiltered.length;
		const skip = useAll ? 0 : (page - 1) * limit;
		const data = useAll
			? projectFiltered
			: projectFiltered.slice(skip, skip + limit);

		return {
			data,
			total,
			page,
			limit: useAll ? total : limit,
			totalPages: useAll ? 1 : Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof data)[number]>;
	}

	async listInvoiceHistory(
		orgId: string,
		userId: string,
		dto: QueryInvoicesDto,
	) {
		const list = await this.listInvoices(orgId, {
			...dto,
			all: true,
			status: "all",
		});
		const routedRows = list.data.filter(
			(row) =>
				row.routedToUserId === userId &&
				row.status !== InvoiceStatus.DRAFT &&
				row.status !== InvoiceStatus.CANCELLED,
		);

		const rawStatus = dto.status?.trim();
		const isPendingStatuses = rawStatus?.toUpperCase() === "PENDING";
		const statusFiltered = isPendingStatuses
			? routedRows.filter((row) => row.status === InvoiceStatus.SUBMITTED)
			: rawStatus && rawStatus !== "all" && rawStatus !== "ALL"
				? routedRows.filter((row) => row.status === rawStatus)
				: routedRows;

		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const useAll = dto.all === true;
		const total = statusFiltered.length;
		const skip = useAll ? 0 : (page - 1) * limit;
		const data = useAll
			? statusFiltered
			: statusFiltered.slice(skip, skip + limit);

		return {
			data,
			total,
			page,
			limit: useAll ? total : limit,
			totalPages: useAll ? 1 : Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof data)[number]>;
	}

	async getInvoiceDraftSummary(orgId: string, dto: QueryInvoicesDto) {
		const list = await this.listInvoices(orgId, {
			...dto,
			all: true,
		});
		const rows = list.data ?? [];
		const totalAmount = rows.reduce(
			(sum, r) => sum + Number(r.totalAmount ?? 0),
			0,
		);
		const disputedAmount = rows.reduce(
			(sum, r) => sum + Number(r.disputedAmount ?? 0),
			0,
		);
		return {
			draftCount: rows.length,
			totalAmount,
			approvedAmount: Math.max(0, totalAmount - disputedAmount),
			disputedAmount,
			totalBillableHours: Math.round(
				rows.reduce((sum, r) => sum + Number(r.totalHours ?? 0), 0),
			),
		};
	}

	private resolveFinalInvoiceUiStatus(input: {
		status: InvoiceStatus;
		dueDate: Date;
	}): FinalInvoiceUiStatus | null {
		if (
			input.status === InvoiceStatus.DRAFT ||
			input.status === InvoiceStatus.SUBMITTED ||
			input.status === InvoiceStatus.CANCELLED
		) {
			return null;
		}
		if (input.status === InvoiceStatus.PAID) return "PAID";
		if (input.status === InvoiceStatus.OVERDUE) return "OVERDUE";
		return input.dueDate.getTime() < Date.now() ? "OVERDUE" : "PENDING_PAYMENT";
	}

	async listFinalInvoices(orgId: string, dto: QueryInvoicesDto) {
		const list = await this.listInvoices(orgId, {
			...dto,
			all: true,
			status: "all",
		});
		const withFinalStatus = list.data
			.map((row) => {
				const finalStatus = this.resolveFinalInvoiceUiStatus({
					status: row.status as InvoiceStatus,
					dueDate: new Date(row.dueDate),
				});
				if (!finalStatus) return null;
				return {
					...row,
					finalStatus,
				};
			})
			.filter((row): row is NonNullable<typeof row> => Boolean(row));

		const filter = (dto.status ?? "all").toUpperCase();
		const statusFiltered =
			filter === "ALL"
				? withFinalStatus
				: withFinalStatus.filter((r) => r.finalStatus === filter);

		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const useAll = dto.all === true;
		const total = statusFiltered.length;
		const skip = useAll ? 0 : (page - 1) * limit;
		const data = useAll
			? statusFiltered
			: statusFiltered.slice(skip, skip + limit);

		return {
			data,
			total,
			page,
			limit: useAll ? total : limit,
			totalPages: useAll ? 1 : Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof data)[number]>;
	}

	async getFinalInvoiceSummary(orgId: string, dto: QueryInvoicesDto) {
		const list = await this.listFinalInvoices(orgId, {
			...dto,
			all: true,
			status: "all",
		});
		const rows = list.data ?? [];
		let paidCount = 0;
		let pendingCount = 0;
		let overdueCount = 0;
		let paidAmount = 0;
		let pendingAmount = 0;
		let overdueAmount = 0;
		for (const row of rows) {
			const amount = Number(row.totalAmount ?? 0);
			if (row.finalStatus === "PAID") {
				paidCount += 1;
				paidAmount += amount;
			} else if (row.finalStatus === "PENDING_PAYMENT") {
				pendingCount += 1;
				pendingAmount += amount;
			} else {
				overdueCount += 1;
				overdueAmount += amount;
			}
		}
		return {
			totalCount: rows.length,
			totalAmount: paidAmount + pendingAmount + overdueAmount,
			paidCount,
			paidAmount,
			pendingCount,
			pendingAmount,
			overdueCount,
			overdueAmount,
		};
	}

	async listVendorInvoices(
		orgId: string,
		vendorId: string,
		dto: QueryInvoicesDto,
	) {
		const [list, org, template] = await Promise.all([
			this.listInvoices(orgId, { ...dto, vendorId }),
			this.prisma.organization.findUnique({
				where: { id: orgId },
				select: { name: true },
			}),
			this.getVendorDeductionTemplate(orgId),
		]);

		const data = list.data.map((row) => {
			const finalAmount = Number(row.totalAmount ?? 0);
			const hours = Number(row.totalHours ?? 0);
			const breakdown = this.computeVendorBreakdown(
				finalAmount,
				hours,
				template,
			);
			return {
				id: row.id,
				invoiceId: row.invoiceNumber,
				dueDate: row.dueDate,
				dueDateLabel: this.formatVendorDate(
					row.dueDate ? new Date(row.dueDate) : null,
				),
				periodStartDate: row.periodStartDate,
				periodEndDate: row.periodEndDate,
				periodLabel: this.formatVendorPeriodLabel(
					row.periodStartDate ? new Date(row.periodStartDate) : null,
					row.periodEndDate ? new Date(row.periodEndDate) : null,
				),
				organization: org?.name ?? "",
				hours,
				grossAmount: breakdown.grossAmount,
				deductions: breakdown.totalDeductions,
				finalAmount,
				status: this.mapVendorInvoiceStatus(row.status as InvoiceStatus),
			};
		});

		return {
			...list,
			data,
		};
	}

	async getVendorInvoiceSummary(
		orgId: string,
		vendorId: string,
		dto: QueryInvoicesDto,
	) {
		const search = dto.search?.trim();
		const normalizedStatus = dto.status?.trim().toUpperCase();
		const statusFilterSql =
			normalizedStatus === "PAID"
				? Prisma.sql`AND i."status" = ${InvoiceStatus.PAID}`
				: normalizedStatus === "DRAFT"
					? Prisma.sql`AND i."status" = ${InvoiceStatus.DRAFT}`
					: normalizedStatus === "SUBMITTED" || normalizedStatus === "PENDING"
						? Prisma.sql`AND i."status" NOT IN (${InvoiceStatus.PAID}, ${InvoiceStatus.DRAFT})`
						: Prisma.sql``;
		const searchFilterSql = search
			? Prisma.sql`AND i."invoiceNumber" ILIKE ${`%${search}%`}`
			: Prisma.sql``;
		const projectFilterSql = dto.projectId
			? Prisma.sql`
				AND EXISTS (
					SELECT 1
					FROM "invoice_line_items" li2
					LEFT JOIN "placement" pl2 ON pl2."id" = li2."placementId"
					LEFT JOIN "requisition" rq2 ON rq2."id" = pl2."requisitionId"
					WHERE li2."invoiceId" = i."id"
						AND rq2."projectId" = ${dto.projectId}::uuid
				)
			`
			: Prisma.sql``;

		const rows = await this.prisma.$queryRaw<
			Array<{
				totalCount: number;
				paidAmount: number;
				pendingAmount: number;
				draftAmount: number;
			}>
		>(Prisma.sql`
			WITH disputes_by_timesheet AS (
				SELECT
					td."timesheetId" AS "timesheetId",
					COUNT(*)::int AS open_disputes,
					SUM(COALESCE(td."disputedAmount", 0))::float8 AS disputed_amount
				FROM "timesheet_disputes" td
				WHERE td."resolvedAt" IS NULL
				GROUP BY td."timesheetId"
			),
			invoice_rollups AS (
				SELECT
					i."id" AS "invoiceId",
					i."status" AS "status",
					GREATEST(
						COALESCE(i."totalAmount", 0)::float8 -
						COALESCE(SUM(
							CASE
								WHEN COALESCE(dbt.open_disputes, 0) > 0
									THEN COALESCE(NULLIF(dbt.disputed_amount, 0), li."amount", 0)::float8
								ELSE 0::float8
							END
						), 0),
						0
					)::float8 AS "adjustedAmount"
				FROM "invoices" i
				LEFT JOIN "invoice_line_items" li ON li."invoiceId" = i."id"
				LEFT JOIN disputes_by_timesheet dbt
					ON dbt."timesheetId" = li."timesheetId"
				WHERE i."organizationId" = ${orgId}::uuid
					AND i."vendorId" = ${vendorId}::uuid
					${searchFilterSql}
					${statusFilterSql}
					${projectFilterSql}
				GROUP BY i."id", i."status", i."totalAmount"
			)
			SELECT
				COUNT(*)::int AS "totalCount",
				COALESCE(SUM(CASE
					WHEN ir."status" = ${InvoiceStatus.PAID}
						THEN ir."adjustedAmount"
					ELSE 0
				END), 0)::float8 AS "paidAmount",
				COALESCE(SUM(CASE
					WHEN ir."status" = ${InvoiceStatus.DRAFT}
						THEN ir."adjustedAmount"
					ELSE 0
				END), 0)::float8 AS "draftAmount",
				COALESCE(SUM(CASE
					WHEN ir."status" NOT IN (${InvoiceStatus.PAID}, ${InvoiceStatus.DRAFT})
						THEN ir."adjustedAmount"
					ELSE 0
				END), 0)::float8 AS "pendingAmount"
			FROM invoice_rollups ir
		`);

		const summary = rows[0] ?? {
			totalCount: 0,
			paidAmount: 0,
			pendingAmount: 0,
			draftAmount: 0,
		};
		return {
			totalCount: Number(summary.totalCount ?? 0),
			paidAmount: Number(summary.paidAmount ?? 0),
			pendingAmount: Number(summary.pendingAmount ?? 0),
			draftAmount: Number(summary.draftAmount ?? 0),
		};
	}

	async getVendorInvoiceBreakdown(
		orgId: string,
		vendorId: string,
		invoiceId: string,
	) {
		const [invoice, org, template, disputedAmount] = await Promise.all([
			this.requireInvoice(orgId, invoiceId),
			this.prisma.organization.findUnique({
				where: { id: orgId },
				select: { name: true },
			}),
			this.getVendorDeductionTemplate(orgId),
			this.getInvoiceOpenDisputedAmount(invoiceId),
		]);
		if (invoice.vendorId !== vendorId) {
			throw new NotFoundException("Invoice not found.");
		}
		const hours = invoice.lineItems.reduce(
			(sum, li) => sum + Number(li.quantity ?? 0),
			0,
		);
		const finalAmount = Math.max(
			0,
			Number(invoice.totalAmount ?? 0) - Number(disputedAmount ?? 0),
		);
		const breakdown = this.computeVendorBreakdown(finalAmount, hours, template);

		return {
			id: invoice.id,
			invoiceId: invoice.invoiceNumber,
			dueDate: invoice.dueDate,
			dueDateLabel: this.formatVendorDate(invoice.dueDate),
			organization: org?.name ?? "",
			periodStartDate: invoice.periodStartDate,
			periodEndDate: invoice.periodEndDate,
			periodLabel: this.formatVendorPeriodLabel(
				invoice.periodStartDate,
				invoice.periodEndDate,
			),
			status: this.mapVendorInvoiceStatus(invoice.status),
			...breakdown,
		};
	}

	async listInvoiceApprovers(orgId: string) {
		const rows = await this.prisma.member.findMany({
			where: {
				organizationId: orgId,
				status: OrganizationMemberStatus.ACTIVE,
				user: {
					OR: [
						{
							role: {
								in: [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN],
							},
						},
						{
							role: UserRole.ORGANIZATION_USER,
							title: { contains: "finance", mode: "insensitive" },
						},
					],
				},
			},
			select: {
				userId: true,
				role: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						title: true,
					},
				},
			},
			orderBy: [{ role: "asc" }, { user: { name: "asc" } }],
		});
		return rows.map((r) => ({
			userId: r.userId,
			name: r.user.name,
			email: r.user.email,
			role:
				r.user.role === UserRole.SUPER_ADMIN ||
				r.user.role === UserRole.GENERAL_ADMIN
					? "ADMIN"
					: "FINANCE",
		}));
	}

	async routeForApproval(
		orgId: string,
		invoiceId: string,
		actorUserId: string,
		dto: { approverUserId: string; routingNotes?: string },
	) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, organizationId: orgId },
			select: { id: true, status: true },
		});
		if (!invoice) throw new NotFoundException("Invoice not found.");
		if (invoice.status === InvoiceStatus.CANCELLED) {
			throw new BadRequestException("Cancelled invoices cannot be routed.");
		}
		if (invoice.status === InvoiceStatus.PAID) {
			throw new BadRequestException("Paid invoices cannot be routed.");
		}

		const approver = await this.prisma.member.findFirst({
			where: {
				organizationId: orgId,
				userId: dto.approverUserId,
				status: OrganizationMemberStatus.ACTIVE,
				user: {
					OR: [
						{
							role: {
								in: [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN],
							},
						},
						{
							role: UserRole.ORGANIZATION_USER,
							title: { contains: "finance", mode: "insensitive" },
						},
					],
				},
			},
			select: { userId: true },
		});
		if (!approver) {
			throw new BadRequestException(
				"Selected approver is not an eligible active organization member",
			);
		}

		await this.prisma.$executeRaw`
			UPDATE "invoices"
			SET
				"routedToUserId" = ${dto.approverUserId}::uuid,
				"routedByUserId" = ${actorUserId}::uuid,
				"routedAt" = NOW(),
				"routingNotes" = ${dto.routingNotes ?? null},
				"status" = CASE
					WHEN ${invoice.status}::"InvoiceStatus" = 'DRAFT'::"InvoiceStatus"
						THEN 'SUBMITTED'::"InvoiceStatus"
					ELSE "status"
				END,
				"submittedById" = CASE
					WHEN ${invoice.status}::"InvoiceStatus" = 'DRAFT'::"InvoiceStatus"
						THEN ${actorUserId}::uuid
					ELSE "submittedById"
				END,
				"submittedAt" = CASE
					WHEN ${invoice.status}::"InvoiceStatus" = 'DRAFT'::"InvoiceStatus"
						THEN NOW()
					ELSE "submittedAt"
				END
			WHERE "id" = ${invoiceId}::uuid
		`;
		return this.getInvoice(orgId, invoiceId);
	}

	async buildInvoiceCsv(orgId: string, invoiceId: string) {
		const invoice = await this.getInvoice(orgId, invoiceId);
		const csvEscape = (v: string | number | Date | null | undefined) =>
			`"${String(v ?? "").replaceAll('"', '""')}"`;
		const approvedLineItems = invoice.lineItems.filter((li) => !li.isDisputed);
		const lines = [
			["Invoice Number", invoice.invoiceNumber].map(csvEscape).join(","),
			["Invoice Date", invoice.invoiceDate].map(csvEscape).join(","),
			["Due Date", invoice.dueDate].map(csvEscape).join(","),
			["Status", invoice.status].map(csvEscape).join(","),
			["Vendor", invoice.vendor?.name ?? ""].map(csvEscape).join(","),
			["Description", "Quantity", "Unit Price", "Amount"]
				.map(csvEscape)
				.join(","),
			...approvedLineItems.map((li) =>
				[li.description, li.quantity, li.unitPrice, li.amount]
					.map(csvEscape)
					.join(","),
			),
		].join("\n");
		return {
			filename: `${invoice.invoiceNumber}.csv`,
			csv: lines,
		};
	}

	async buildInvoicePdf(orgId: string, invoiceId: string) {
		const invoice = await this.getInvoice(orgId, invoiceId);
		const filename = `${invoice.invoiceNumber}.pdf`;
		const doc = new PDFDocument({ size: "A4", margin: 50 });
		const chunks: Buffer[] = [];
		const done = new Promise<Buffer>((resolve, reject) => {
			doc.on("data", (chunk) => chunks.push(chunk as Buffer));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);
		});

		const fmtDate = (value: Date | string | null | undefined) =>
			value ? new Date(value).toLocaleDateString() : "—";
		const money = (n: number | null | undefined) =>
			`$${Number(n ?? 0).toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})}`;

		doc.fontSize(20).text(invoice.vendor?.name ?? "Invoice", { align: "left" });
		doc.moveDown(0.5);
		doc
			.fontSize(11)
			.text(`Invoice Number: ${invoice.invoiceNumber}`)
			.text(`Invoice Date: ${fmtDate(invoice.invoiceDate)}`)
			.text(`Due Date: ${fmtDate(invoice.dueDate)}`)
			.text(`Status: ${invoice.status}`)
			.text(`Payment Terms: ${invoice.paymentTerms ?? "—"}`);

		doc.moveDown(1);
		doc.fontSize(12).text("Line Items", { underline: true });
		doc.moveDown(0.5);
		doc.fontSize(10).text("Description", 50, doc.y, { width: 240 });
		doc.text("Qty", 300, doc.y - 12, { width: 50, align: "right" });
		doc.text("Rate", 360, doc.y - 12, { width: 80, align: "right" });
		doc.text("Amount", 450, doc.y - 12, { width: 95, align: "right" });
		doc.moveDown(0.4);
		doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#CCCCCC").stroke();
		doc.moveDown(0.4);

		for (const li of invoice.lineItems.filter((l) => !l.isDisputed)) {
			const y = doc.y;
			doc.fontSize(10).text(li.description ?? "—", 50, y, { width: 240 });
			doc.text(String(li.quantity ?? 0), 300, y, { width: 50, align: "right" });
			doc.text(money(li.unitPrice), 360, y, { width: 80, align: "right" });
			doc.text(money(li.amount), 450, y, { width: 95, align: "right" });
			doc.moveDown(0.8);
			if (doc.y > 760) {
				doc.addPage();
			}
		}

		doc.moveDown(0.5);
		doc.moveTo(330, doc.y).lineTo(545, doc.y).strokeColor("#CCCCCC").stroke();
		doc.moveDown(0.6);
		doc
			.fontSize(11)
			.text("Subtotal", 360, doc.y, { width: 80, align: "right" });
		doc.text(money(invoice.subtotal), 450, doc.y - 12, {
			width: 95,
			align: "right",
		});
		doc.text("Tax", 360, doc.y, { width: 80, align: "right" });
		doc.text(money(invoice.taxAmount), 450, doc.y - 12, {
			width: 95,
			align: "right",
		});
		doc.text("Discount", 360, doc.y, { width: 80, align: "right" });
		doc.text(`-${money(invoice.discountAmount)}`, 450, doc.y - 12, {
			width: 95,
			align: "right",
		});
		doc.moveDown(0.3);
		doc.moveTo(330, doc.y).lineTo(545, doc.y).strokeColor("#CCCCCC").stroke();
		doc.moveDown(0.6);
		doc
			.fontSize(12)
			.text("Total Due", 360, doc.y, { width: 80, align: "right" });
		doc.text(
			money(
				Math.max(
					0,
					Number(invoice.totalAmount ?? 0) - Number(invoice.amountPaid ?? 0),
				),
			),
			450,
			doc.y - 14,
			{ width: 95, align: "right" },
		);

		doc.end();
		const pdf = await done;
		return { filename, pdf };
	}

	async getInvoice(orgId: string, invoiceId: string) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, organizationId: orgId },
			include: invoiceDetailInclude,
		});
		if (!invoice) throw new NotFoundException("Invoice not found.");

		if (!invoice.lineItems?.length) {
			const adjustedSubtotal = 0;
			const adjustedTotalAmount = Math.max(
				0,
				adjustedSubtotal +
					Number(invoice.taxAmount ?? 0) -
					Number(invoice.discountAmount ?? 0),
			);
			return {
				...invoice,
				subtotal: adjustedSubtotal,
				totalAmount: adjustedTotalAmount,
				departmentDetails: [],
				draftSummary: {
					totalAmountForPeriod: 0,
					totalWorkers: 0,
					totalHours: 0,
					approvedAmount: 0,
					disputedAmount: 0,
					approvedItemCount: 0,
					disputedItemCount: 0,
					totalLineItemCount: 0,
					status: "READY_FOR_REVIEW",
				},
			};
		}

		type LineMetaRow = {
			lineItemId: string;
			candidateName: string | null;
			locationName: string | null;
			departmentId: string | null;
			departmentName: string | null;
			workDate: Date | null;
			timeEntryId: string | null;
			payCode: string | null;
			regularHrs: number;
			otHrs: number;
			holidayHrs: number;
			disputeReason: string | null;
			disputedAmount: number;
			hasOpenDispute: boolean;
		};

		const metaRows = await this.prisma.$queryRaw<LineMetaRow[]>`
			WITH disputes_by_timesheet AS (
				SELECT
					td."timesheetId" AS "timesheetId",
					COUNT(*)::int AS open_disputes,
					(ARRAY_AGG(td."description" ORDER BY td."raisedAt" DESC NULLS LAST))[1] AS dispute_reason,
					SUM(COALESCE(td."disputedAmount", 0))::float8 AS disputed_amount
				FROM "timesheet_disputes" td
				WHERE td."resolvedAt" IS NULL
				GROUP BY td."timesheetId"
			),
			entry_meta AS (
				SELECT
					e."timesheetId" AS "timesheetId",
					(ARRAY_AGG(e."id" ORDER BY e."workDate" ASC))[1] AS entry_id,
					MIN(e."workDate") AS work_date,
					(ARRAY_AGG(loc."name" ORDER BY e."workDate" ASC))[1] AS location_name,
					(ARRAY_AGG(pc."code" ORDER BY e."workDate" ASC))[1] AS pay_code,
					COALESCE(SUM(CASE
						WHEN
							EXISTS (
								SELECT 1
								FROM "organization_holiday" oh
								WHERE oh."organizationId" = e."organizationId"
									AND oh."observedOn"::date = e."workDate"::date
							)
							THEN 0
						ELSE COALESCE(e."regularHours", 0)
					END), 0)::float8 AS regular_hours,
					COALESCE(SUM(CASE
						WHEN
							EXISTS (
								SELECT 1
								FROM "organization_holiday" oh
								WHERE oh."organizationId" = e."organizationId"
									AND oh."observedOn"::date = e."workDate"::date
							)
							THEN 0
						ELSE COALESCE(e."overtimeHours", 0)
					END), 0)::float8 AS ot_hours,
					COALESCE(SUM(CASE
						WHEN
							EXISTS (
								SELECT 1
								FROM "organization_holiday" oh
								WHERE oh."organizationId" = e."organizationId"
									AND oh."observedOn"::date = e."workDate"::date
							)
							THEN COALESCE(e."regularHours", 0) + COALESCE(e."overtimeHours", 0)
						ELSE 0
					END), 0)::float8 AS holiday_hours
				FROM "timesheet_entry" e
				LEFT JOIN "organization_location" loc ON loc."id" = e."locationId"
				LEFT JOIN "organization_pay_code" pc ON pc."id" = e."payCodeId"
				GROUP BY e."timesheetId"
			)
			SELECT
				li."id" AS "lineItemId",
				u."name" AS "candidateName",
				em.location_name AS "locationName",
				COALESCE(t."departmentId"::text, rq."departmentId"::text) AS "departmentId",
				COALESCE(dts."name", drq."name") AS "departmentName",
				em.work_date AS "workDate",
				em.entry_id::text AS "timeEntryId",
				em.pay_code AS "payCode",
				em.regular_hours AS "regularHrs",
				em.ot_hours AS "otHrs",
				em.holiday_hours AS "holidayHrs",
				dbt.dispute_reason AS "disputeReason",
				COALESCE(dbt.disputed_amount, 0)::float8 AS "disputedAmount",
				(COALESCE(dbt.open_disputes, 0) > 0) AS "hasOpenDispute"
			FROM "invoice_line_items" li
			LEFT JOIN "timesheet" t ON t."id" = li."timesheetId"
			LEFT JOIN "placement" pl ON pl."id" = COALESCE(li."placementId", t."placementId")
			LEFT JOIN "requisition" rq ON rq."id" = pl."requisitionId"
			LEFT JOIN "department" dts ON dts."id" = t."departmentId"
			LEFT JOIN "department" drq ON drq."id" = rq."departmentId"
			LEFT JOIN "candidate" c ON c."id" = COALESCE(li."candidateId", t."candidateId")
			LEFT JOIN "user" u ON u."id" = c."userId"
			LEFT JOIN entry_meta em ON em."timesheetId" = li."timesheetId"
			LEFT JOIN disputes_by_timesheet dbt ON dbt."timesheetId" = li."timesheetId"
			WHERE li."invoiceId" = ${invoiceId}::uuid
		`;

		const metaByLineId = new Map(metaRows.map((r) => [r.lineItemId, r]));
		const enrichedLineItems = invoice.lineItems.map((li) => {
			const meta = metaByLineId.get(li.id);
			const disputedAmount = Number(meta?.disputedAmount ?? 0);
			return {
				...li,
				candidateName: meta?.candidateName ?? undefined,
				locationName: meta?.locationName ?? undefined,
				departmentId: meta?.departmentId ?? undefined,
				departmentName: meta?.departmentName ?? undefined,
				workDate: meta?.workDate?.toISOString() ?? undefined,
				timeEntryId: meta?.timeEntryId ?? undefined,
				payCode: meta?.payCode ?? undefined,
				regularHrs:
					meta?.regularHrs !== undefined
						? Number(meta.regularHrs)
						: Number(li.quantity ?? 0),
				otHrs: meta?.otHrs !== undefined ? Number(meta.otHrs) : 0,
				holidayHrs:
					meta?.holidayHrs !== undefined ? Number(meta.holidayHrs) : 0,
				disputeReason: meta?.disputeReason ?? undefined,
				disputedAmount,
				isDisputed: Boolean(meta?.hasOpenDispute) || disputedAmount > 0,
			};
		});
		const approvedItems = enrichedLineItems.filter((li) => !li.isDisputed);
		const disputedItems = enrichedLineItems.filter((li) => li.isDisputed);
		const departmentMap = new Map<
			string,
			{
				id: string;
				name: string;
				costCenter: string;
				candidatesCount: number;
				hours: number;
				amount: number;
				entries: Array<{
					id: string;
					name: string;
					role: string;
					source: "mobile" | "upload";
					regularHrs: number;
					otHrs: number;
					holidayHrs: number;
					billRate: number;
					total: number;
					status: string;
				}>;
			}
		>();
		for (const li of approvedItems) {
			const key = li.departmentId || "UNASSIGNED_DEPARTMENT";
			const departmentLabel = li.departmentName || "Unassigned";
			const existing = departmentMap.get(key) ?? {
				id: key,
				name: departmentLabel,
				costCenter: departmentLabel,
				candidatesCount: 0,
				hours: 0,
				amount: 0,
				entries: [],
			};
			const regular = Number(li.regularHrs ?? li.quantity ?? 0);
			const ot = Number(li.otHrs ?? 0);
			const holiday = Number(li.holidayHrs ?? 0);
			const amount = Number(li.amount ?? 0);
			const source: "mobile" | "upload" =
				typeof li.lineType === "string" &&
				li.lineType.toUpperCase().includes("MOBILE")
					? "mobile"
					: "upload";
			existing.entries.push({
				id: li.id,
				name: li.candidateName || li.description || "N/A",
				role: li.payCode || li.lineType || "N/A",
				source,
				regularHrs: this.roundHours(regular),
				otHrs: this.roundHours(ot),
				holidayHrs: this.roundHours(holiday),
				billRate: Number(li.unitPrice ?? 0),
				total: amount,
				status: "Validated",
			});
			existing.amount += amount;
			existing.hours += this.roundHours(regular + ot + holiday);
			departmentMap.set(key, existing);
		}
		for (const group of departmentMap.values()) {
			group.candidatesCount = new Set(group.entries.map((e) => e.name)).size;
		}
		const departmentDetails = Array.from(departmentMap.values());
		const approvedAmount = approvedItems.reduce(
			(sum, li) => sum + Number(li.amount ?? 0),
			0,
		);
		const explicitDisputed = disputedItems.reduce(
			(sum, li) => sum + Number(li.disputedAmount ?? 0),
			0,
		);
		const disputedAmount =
			explicitDisputed > 0
				? explicitDisputed
				: disputedItems.reduce((sum, li) => sum + Number(li.amount ?? 0), 0);
		const totalWorkers = new Set(
			approvedItems.map((li) => li.candidateName || li.candidateId || li.id),
		).size;
		const totalHours = approvedItems.reduce(
			(sum, li) => sum + Number(li.quantity ?? 0),
			0,
		);
		const adjustedSubtotal = approvedAmount;
		const adjustedTotalAmount = Math.max(
			0,
			adjustedSubtotal +
				Number(invoice.taxAmount ?? 0) -
				Number(invoice.discountAmount ?? 0),
		);

		return {
			...invoice,
			subtotal: adjustedSubtotal,
			totalAmount: adjustedTotalAmount,
			lineItems: enrichedLineItems,
			departmentDetails,
			draftSummary: {
				totalAmountForPeriod: approvedAmount,
				totalWorkers,
				totalHours: this.roundHours(totalHours),
				approvedAmount,
				disputedAmount,
				approvedItemCount: approvedItems.length,
				disputedItemCount: disputedItems.length,
				totalLineItemCount: enrichedLineItems.length,
				status: disputedAmount > 0 ? "PARTIALLY_DISPUTED" : "READY_FOR_REVIEW",
			},
		};
	}

	async updateInvoiceStatus(
		orgId: string,
		invoiceId: string,
		next: InvoiceStatus,
	) {
		return this.applyStatusTransition(orgId, invoiceId, next);
	}

	private async applyStatusTransition(
		orgId: string,
		invoiceId: string,
		next: InvoiceStatus,
	) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, organizationId: orgId },
			select: { id: true, status: true },
		});
		if (!invoice) throw new NotFoundException("Invoice not found.");

		const allowed = STATUS_TRANSITIONS[invoice.status];
		if (!allowed.includes(next)) {
			throw new BadRequestException(
				`This invoice can't move from ${invoice.status.toLowerCase()} to ${next.toLowerCase()}.`,
			);
		}

		return this.prisma.invoice.update({
			where: { id: invoiceId },
			data: { status: next },
			include: invoiceDetailInclude,
		});
	}

	async getPendingInvoiceCount(orgId: string) {
		return this.prisma.invoice.count({
			where: {
				organizationId: orgId,
				status: InvoiceStatus.SUBMITTED,
			},
		});
	}

	async getInvoiceHistoryPendingCount(orgId: string, userId: string) {
		return this.prisma.invoice.count({
			where: {
				organizationId: orgId,
				routedToUserId: userId,
				status: InvoiceStatus.SUBMITTED,
			},
		});
	}
}

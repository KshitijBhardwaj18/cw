import {
	BackGroundJobStatus,
	InvoiceStatus,
	Prisma,
	type PrismaClient,
	TimesheetEntryStatus,
} from "@repo/db";
import type {
	BillingGenerateInvoicesJobResult,
	BillingGenerateInvoicesPayload,
	BillingRefreshSpendAnalyticsPayload,
	CandidateWorkforceType,
	WorkforceBillingFeeType,
} from "@repo/shared";
import {
	BackGroundJobName,
	EXTERNAL_WORKFORCE_TYPES,
	INTERNAL_WORKFORCE_TYPES,
	INVOICE_GROUPING_METHODS,
	parseIsoDateOnly,
	SELF_WORKFORCE_TYPES,
} from "@repo/shared";
import type { Queue } from "bullmq";
import {
	type BillableRow,
	buildExternalTimesheetBillableRow,
	buildInternalPlacementDescription,
	buildInternalShiftDescription,
	calculateInternalLongTermCharge,
	calculateInternalShiftCharge,
	parseInternalShiftIdFromDescription,
} from "./billing-generate-invoice-formulas.js";

const DEFAULT_PAY_CODE_MULTIPLIER = 1;

function parseNetDays(terms: string | null | undefined): number {
	if (!terms) return 30;
	const m = terms.match(/net[_\s-]?(\d+)/i);
	if (!m) return 30;
	const n = Number(m[1]);
	return Number.isFinite(n) && n > 0 ? n : 30;
}

function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setUTCDate(d.getUTCDate() + days);
	return d;
}

function roundTo(value: number, decimals: number): number {
	const p = 10 ** decimals;
	return Math.round(value * p) / p;
}

async function generateInvoiceNumber(prisma: PrismaClient): Promise<string> {
	for (let i = 0; i < 10; i += 1) {
		const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
		const invoiceNumber = `INV-${new Date().getUTCFullYear()}-${suffix}`;
		const exists = await prisma.invoice.findUnique({
			where: { invoiceNumber },
			select: { id: true },
		});
		if (!exists) return invoiceNumber;
	}
	throw new Error("Failed to generate unique invoice number");
}

export async function runBillingGenerateInvoicesProcessor(
	prisma: PrismaClient,
	payload: BillingGenerateInvoicesPayload,
	billingQueue: Queue,
): Promise<void> {
	await prisma.backGroundJob.update({
		where: { id: payload.jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});

	const result: BillingGenerateInvoicesJobResult = {
		createdInvoices: 0,
		createdLineItems: 0,
		skippedTimesheets: 0,
		failedTimesheets: 0,
		errors: [],
	};

	try {
		const periodFrom = parseIsoDateOnly(payload.periodFrom);
		const periodTo = parseIsoDateOnly(payload.periodTo);
		if (!periodFrom || !periodTo) {
			throw new Error("Invalid periodFrom/periodTo");
		}

		const billingConfig = await prisma.billingConfig.findFirst({
			where: { organizationId: payload.organizationId },
			select: {
				paymentTerms: true,
				billingStreet: true,
				billingCity: true,
				billingState: true,
				billingZip: true,
				timesheetApproval: true,
				invoiceGrouping: true,
			},
		});
		const invoiceEligibleStatuses =
			billingConfig?.timesheetApproval === false
				? [TimesheetEntryStatus.APPROVED, TimesheetEntryStatus.PENDING]
				: [TimesheetEntryStatus.APPROVED];
		const invoiceEligibleStatusesSql = Prisma.join(invoiceEligibleStatuses);

		const invoiceDate = new Date(periodTo);
		const dueDate = addDays(
			invoiceDate,
			parseNetDays(billingConfig?.paymentTerms),
		);
		const billToAddress = billingConfig
			? [
					billingConfig.billingStreet,
					[billingConfig.billingCity, billingConfig.billingState]
						.filter(Boolean)
						.join(", "),
					billingConfig.billingZip,
				]
					.filter((v) => (v ?? "").toString().trim().length > 0)
					.join("\n")
			: null;

		await prisma.$executeRaw`
			UPDATE "timesheet_entry" AS e
			SET
				"billRate" = ROUND(((
					COALESCE(p."billRate", s."shiftRate", 0)
					* COALESCE(pc."multiplier", ${DEFAULT_PAY_CODE_MULTIPLIER})
				)::numeric), 4)::float8,
				"billAmount" = ROUND(((
					COALESCE(p."billRate", s."shiftRate", 0)
					* COALESCE(pc."multiplier", ${DEFAULT_PAY_CODE_MULTIPLIER})
					* COALESCE(
						e2."hours",
						COALESCE(e2."regularHours", 0) + COALESCE(e2."overtimeHours", 0)
					)
				)::numeric), 2)::float8
			FROM "timesheet_entry" AS e2
			LEFT JOIN "placement" AS p ON p."id" = e2."placementId"
			LEFT JOIN "per_diem_assignments" pda ON pda."id" = e2."perDiemAssignmentId"
			LEFT JOIN "per_diem_shifts" s ON s."id" = pda."shiftId"
			LEFT JOIN "organization_pay_code" AS pc ON pc."id" = e2."payCodeId"
			WHERE e."id" = e2."id"
				AND e2."organizationId" = ${payload.organizationId}::uuid
				AND e2."status" IN (${invoiceEligibleStatusesSql})
				AND e2."workDate" BETWEEN ${periodFrom} AND ${periodTo}
				AND (e2."billRate" IS NULL OR e2."billAmount" IS NULL)
		`;

		const workforceRates =
			await prisma.organizationWorkforceBillingRate.findMany({
				where: { organizationId: payload.organizationId, isActive: true },
				select: { workforceType: true, techFee: true, feeType: true },
			});
		const rateByWorkforce = new Map<
			CandidateWorkforceType,
			{ techFee: number; feeType: WorkforceBillingFeeType }
		>(
			workforceRates.map((r) => [
				r.workforceType as CandidateWorkforceType,
				{
					techFee: Number(r.techFee),
					feeType: r.feeType as WorkforceBillingFeeType,
				},
			]),
		);
		const externalTypes = [...EXTERNAL_WORKFORCE_TYPES];
		const internalTypes = [
			...INTERNAL_WORKFORCE_TYPES,
			...SELF_WORKFORCE_TYPES,
		];

		const externalTimesheets = await prisma.timesheet.findMany({
			where: {
				organizationId: payload.organizationId,
				candidate: {
					OR: [
						{
							workforceType: {
								in: externalTypes as CandidateWorkforceType[],
							},
						},
						{ workforceType: null },
					],
				},
				entries: {
					some: {
						status: { in: invoiceEligibleStatuses },
						workDate: { gte: periodFrom, lte: periodTo },
					},
				},
				invoiceLineItems: {
					none: {
						invoice: {
							organizationId: payload.organizationId,
							status: { not: InvoiceStatus.CANCELLED },
						},
					},
				},
			},
			select: {
				id: true,
				placementId: true,
				candidateId: true,
				placement: { select: { vendorId: true } },
				perDiemAssignment: { select: { vendorId: true } },
				entries: {
					where: {
						status: { in: invoiceEligibleStatuses },
						workDate: { gte: periodFrom, lte: periodTo },
					},
					select: {
						workDate: true,
						billAmount: true,
						hours: true,
						regularHours: true,
						overtimeHours: true,
						placement: { select: { vendorId: true } },
						perDiemAssignment: { select: { vendorId: true } },
					},
				},
			},
		});
		const billableRows: BillableRow[] = [];

		for (const ts of externalTimesheets) {
			const row = buildExternalTimesheetBillableRow({
				id: ts.id,
				candidateId: ts.candidateId,
				placementId: ts.placementId,
				placementVendorId: ts.placement?.vendorId ?? null,
				assignmentVendorId: ts.perDiemAssignment?.vendorId ?? null,
				entries: ts.entries.map((e) => ({
					workDate: e.workDate,
					billAmount: e.billAmount,
					hours: Number(
						e.hours ?? (e.regularHours ?? 0) + (e.overtimeHours ?? 0),
					),
					placementVendorId: e.placement?.vendorId ?? null,
					assignmentVendorId: e.perDiemAssignment?.vendorId ?? null,
				})),
			});
			if (!row) {
				result.failedTimesheets += 1;
				result.errors.push({
					timesheetId: ts.id,
					message:
						"External timesheet has zero billAmount; verify bill rate backfill",
				});
				continue;
			}
			billableRows.push(row);
		}

		const alreadyBilledInternalPlacement =
			await prisma.invoiceLineItem.findMany({
				where: {
					placementId: { not: null },
					lineType: "TECH_FEE_INTERNAL_LTO",
					invoice: {
						organizationId: payload.organizationId,
						periodStartDate: periodFrom,
						periodEndDate: periodTo,
						status: { not: InvoiceStatus.CANCELLED },
					},
				},
				select: { placementId: true },
			});
		const alreadyBilledInternalPlacementIds = new Set(
			alreadyBilledInternalPlacement
				.map((r) => r.placementId)
				.filter((v): v is string => Boolean(v)),
		);

		const internalPlacements = await prisma.placement.findMany({
			where: {
				organizationId: payload.organizationId,
				candidate: {
					workforceType: { in: internalTypes as CandidateWorkforceType[] },
				},
				startDate: { lte: periodTo },
				OR: [{ endDate: null }, { endDate: { gte: periodFrom } }],
			},
			select: {
				id: true,
				candidateId: true,
				vendorId: true,
				startDate: true,
				endDate: true,
				hoursPerWeek: true,
				candidate: { select: { workforceType: true } },
			},
		});
		for (const p of internalPlacements) {
			if (alreadyBilledInternalPlacementIds.has(p.id)) continue;
			const workforceType = p.candidate
				.workforceType as CandidateWorkforceType | null;
			if (!workforceType) continue;
			const rate = rateByWorkforce.get(workforceType);
			if (!rate || rate.techFee <= 0) continue;
			const longTerm = calculateInternalLongTermCharge({
				startDate: p.startDate,
				endDate: p.endDate,
				periodFrom,
				periodTo,
				hoursPerWeek: Number(p.hoursPerWeek ?? 0),
				techFee: rate.techFee,
				feeType: rate.feeType,
			});
			if (!longTerm) continue;

			billableRows.push({
				vendorId: p.vendorId ?? null,
				candidateId: p.candidateId,
				placementId: p.id,
				timesheetId: null,
				periodStart: periodFrom,
				periodEnd: periodTo,
				hours: longTerm.hours,
				amount: longTerm.amount,
				lineType: "TECH_FEE_INTERNAL_LTO",
				description: buildInternalPlacementDescription(p.id),
			});
		}

		const alreadyBilledInternalShift = await prisma.invoiceLineItem.findMany({
			where: {
				lineType: "TECH_FEE_INTERNAL_SHIFT",
				invoice: {
					organizationId: payload.organizationId,
					periodStartDate: periodFrom,
					periodEndDate: periodTo,
					status: { not: InvoiceStatus.CANCELLED },
				},
			},
			select: { description: true },
		});
		const alreadyBilledInternalShiftIds = new Set(
			alreadyBilledInternalShift
				.map((r) => parseInternalShiftIdFromDescription(r.description))
				.filter((v): v is string => Boolean(v)),
		);

		const internalShiftAssignments = await prisma.perDiemAssignment.findMany({
			where: {
				shift: {
					organizationId: payload.organizationId,
					shiftDate: { gte: periodFrom, lte: periodTo },
				},
				cancelledAt: null,
				candidate: {
					workforceType: { in: internalTypes as CandidateWorkforceType[] },
				},
			},
			select: {
				id: true,
				candidateId: true,
				vendorId: true,
				candidate: { select: { workforceType: true } },
				shift: { select: { shiftDate: true, totalShiftHours: true } },
			},
		});
		for (const a of internalShiftAssignments) {
			if (alreadyBilledInternalShiftIds.has(a.id)) continue;
			const workforceType = a.candidate
				.workforceType as CandidateWorkforceType | null;
			if (!workforceType) continue;
			const rate = rateByWorkforce.get(workforceType);
			if (!rate || rate.techFee <= 0) continue;
			const shiftCharge = calculateInternalShiftCharge({
				shiftHours: Number(a.shift.totalShiftHours ?? 0),
				techFee: rate.techFee,
				feeType: rate.feeType,
			});
			if (!shiftCharge) continue;

			billableRows.push({
				vendorId: a.vendorId ?? null,
				candidateId: a.candidateId,
				placementId: null,
				timesheetId: null,
				periodStart: a.shift.shiftDate,
				periodEnd: a.shift.shiftDate,
				hours: shiftCharge.hours,
				amount: shiftCharge.amount,
				lineType: "TECH_FEE_INTERNAL_SHIFT",
				description: buildInternalShiftDescription(a.id),
			});
		}

		const groupingPreference = INVOICE_GROUPING_METHODS.includes(
			billingConfig?.invoiceGrouping as (typeof INVOICE_GROUPING_METHODS)[number],
		)
			? (billingConfig?.invoiceGrouping as (typeof INVOICE_GROUPING_METHODS)[number])
			: "By Requisition";
		const placementIds = [
			...new Set(
				billableRows
					.map((row) => row.placementId)
					.filter((v): v is string => Boolean(v)),
			),
		];
		const placementMeta = await prisma.placement.findMany({
			where: { id: { in: placementIds } },
			select: { id: true, departmentId: true, locationId: true },
		});
		const placementMetaById = new Map(
			placementMeta.map((row) => [row.id, row] as const),
		);

		const byVendor = new Map<
			string,
			{ vendorId: string | null; rows: BillableRow[] }
		>();
		for (const row of billableRows) {
			let groupingKey = row.placementId ?? row.candidateId;
			if (groupingPreference === "By Candidate") {
				groupingKey = row.candidateId;
			}
			if (groupingPreference === "By Department") {
				groupingKey = row.placementId
					? (placementMetaById.get(row.placementId)?.departmentId ??
						`unassigned:${row.candidateId}`)
					: `unassigned:${row.candidateId}`;
			}
			if (groupingPreference === "By Location") {
				groupingKey = row.placementId
					? (placementMetaById.get(row.placementId)?.locationId ??
						`unassigned:${row.candidateId}`)
					: `unassigned:${row.candidateId}`;
			}
			const mapKey = `${row.vendorId ?? "none"}|${groupingKey}`;
			const entry = byVendor.get(mapKey) ?? {
				vendorId: row.vendorId,
				rows: [],
			};
			const list = entry.rows;
			list.push(row);
			byVendor.set(mapKey, entry);
		}
		for (const entry of byVendor.values()) {
			const vendorId = entry.vendorId;
			const rows = entry.rows;
			const invoiceNumber = await generateInvoiceNumber(prisma);
			const subtotal = roundTo(
				rows.reduce((sum, r) => sum + (r.amount ?? 0), 0),
				2,
			);

			const invoice = await prisma.invoice.create({
				data: {
					organizationId: payload.organizationId,
					vendorId,
					invoiceNumber,
					billToAddress,
					invoiceDate,
					dueDate,
					periodStartDate: periodFrom,
					periodEndDate: periodTo,
					subtotal,
					taxAmount: 0,
					discountAmount: 0,
					adjustmentAmount: 0,
					totalAmount: subtotal,
					amountPaid: 0,
					paymentTerms: billingConfig?.paymentTerms ?? "net_30",
					status: InvoiceStatus.DRAFT,
				},
				select: { id: true },
			});

			const lineItems = rows.map((r) => {
				const qty = r.hours > 0 ? r.hours : 1;
				const unitPrice = r.hours > 0 ? r.amount / r.hours : r.amount;
				return {
					invoiceId: invoice.id,
					timesheetId: r.timesheetId,
					placementId: r.placementId,
					candidateId: r.candidateId,
					description: r.description,
					quantity: roundTo(qty, 2),
					unitPrice: roundTo(unitPrice, 4),
					amount: roundTo(r.amount, 2),
					lineType: r.lineType,
					periodStart: r.periodStart,
					periodEnd: r.periodEnd,
				};
			});

			await prisma.invoiceLineItem.createMany({ data: lineItems });
			result.createdInvoices += 1;
			result.createdLineItems += lineItems.length;
		}

		const refreshPayload: BillingRefreshSpendAnalyticsPayload = {
			organizationId: payload.organizationId,
			periodFrom: payload.periodFrom,
			periodTo: payload.periodTo,
		};
		try {
			await billingQueue.add(
				BackGroundJobName.BILLING_REFRESH_SPEND_ANALYTICS,
				refreshPayload,
			);
		} catch (queueError) {
			const message =
				queueError instanceof Error
					? queueError.message
					: "Failed to enqueue spend analytics refresh job";
			result.errors.push({ message: `Refresh enqueue failed: ${message}` });
			throw new Error(
				`Invoice generation succeeded but refresh enqueue failed: ${message}`,
			);
		}
		await prisma.backGroundJob.update({
			where: { id: payload.jobId },
			data: {
				status: BackGroundJobStatus.COMPLETED,
				completedAt: new Date(),
				result: result as object,
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		result.errors.push({ message });
		await prisma.backGroundJob.update({
			where: { id: payload.jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				completedAt: new Date(),
				result: result as object,
			},
		});
		throw err;
	}
}

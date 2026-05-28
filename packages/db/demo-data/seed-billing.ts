/**
 * Billing demo seed — invoices (multiple statuses + line items) and timesheet
 * entries for an org that already has OrganizationVendor + related data.
 *
 * Spend analytics are computed at query time from invoices and timesheet data;
 * there is no persisted spend_analytics table.
 *
 * Idempotent for re-runs: removes prior seed rows by `invoiceNumber` prefix
 * `SEED-DEMO-`, then recreates demo invoices.
 *
 * Run via `bun run --cwd packages/db db:seed:billing` (or `db:seed:demo` / `db:seed:all`).
 */

import type { PrismaClient } from "@repo/db";
import {
	InvoiceStatus,
	OrganizationMemberStatus,
	OrganizationVendorStatus,
	TimeEntryDataSource,
	TimesheetEntryStatus,
} from "@repo/db";

const INVOICE_PREFIX = "SEED-DEMO-";

function line(
	description: string,
	quantity: number,
	unitPrice: number,
): {
	description: string;
	quantity: number;
	unitPrice: number;
	amount: number;
} {
	const amount = Math.round(quantity * unitPrice * 100) / 100;
	return { description, quantity, unitPrice, amount };
}

function isHolidayPayCode(code?: string | null, category?: string | null) {
	const c = String(category ?? "").toUpperCase();
	const k = String(code ?? "").toUpperCase();
	return c === "HOLIDAY" || k.startsWith("HOL");
}

export async function seedBillingDemo(prisma: PrismaClient): Promise<void> {
	const orgVendor = await prisma.organizationVendor.findFirst({
		where: { status: OrganizationVendorStatus.ACTIVE },
		select: { organizationId: true, vendorId: true },
		orderBy: { createdAt: "asc" },
	});
	if (!orgVendor) {
		console.log(
			"seedBillingDemo: skip — no ACTIVE organization_vendor (run org/vendor seeds first)",
		);
		return;
	}

	const { organizationId: orgId, vendorId } = orgVendor;

	const member = await prisma.member.findFirst({
		where: {
			organizationId: orgId,
			status: OrganizationMemberStatus.ACTIVE,
		},
		select: { userId: true },
		orderBy: { createdAt: "asc" },
	});
	const actorId = member?.userId ?? null;

	const [payCodes, seedTimesheets] = await Promise.all([
		prisma.organizationPayCode.findMany({
			where: { organizationId: orgId, isActive: true },
			select: { id: true, code: true, category: true },
		}),
		prisma.timesheet.findMany({
			where: { organizationId: orgId },
			select: {
				id: true,
				organizationId: true,
				candidateId: true,
				placementId: true,
				departmentId: true,
				locationId: true,
				weekEndingDate: true,
			},
			orderBy: { weekEndingDate: "desc" },
			take: 24,
		}),
	]);
	const regPayCodeId =
		payCodes.find((pc) => pc.code.toUpperCase() === "REG")?.id ?? null;
	const otPayCodeId =
		payCodes.find((pc) => pc.code.toUpperCase() === "OT")?.id ?? null;
	const holidayPayCodeId =
		payCodes.find((pc) => isHolidayPayCode(pc.code, pc.category))?.id ?? null;

	for (const [idx, ts] of seedTimesheets.slice(0, 12).entries()) {
		const tag = `SEED-BILLING-MIX-${ts.id}`;
		const existing = await prisma.timesheetEntry.findFirst({
			where: { timesheetId: ts.id, notes: `${tag}-REG` },
			select: { id: true },
		});
		if (existing) continue;
		const base = new Date(ts.weekEndingDate);
		const regDate = new Date(base);
		regDate.setUTCDate(base.getUTCDate() - 3);
		const otDate = new Date(base);
		otDate.setUTCDate(base.getUTCDate() - 2);
		const holDate = new Date(base);
		holDate.setUTCDate(base.getUTCDate() - 1);
		const regRate = 80 + (idx % 6) * 2;
		const otRate = regRate * 1.5;
		const holRate = regRate;
		const regHours = 8 + (idx % 2) * 2;
		const otHours = 2 + (idx % 3);
		const holidayHours = 8;
		await prisma.timesheetEntry.createMany({
			data: [
				{
					timesheetId: ts.id,
					organizationId: ts.organizationId,
					candidateId: ts.candidateId,
					placementId: ts.placementId ?? null,
					departmentId: ts.departmentId ?? null,
					locationId: ts.locationId ?? null,
					payCodeId: regPayCodeId,
					workDate: regDate,
					regularHours: regHours,
					overtimeHours: 0,
					hours: regHours,
					billRate: regRate,
					billAmount: regHours * regRate,
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.MANUAL,
					notes: `${tag}-REG`,
				},
				{
					timesheetId: ts.id,
					organizationId: ts.organizationId,
					candidateId: ts.candidateId,
					placementId: ts.placementId ?? null,
					departmentId: ts.departmentId ?? null,
					locationId: ts.locationId ?? null,
					payCodeId: otPayCodeId,
					workDate: otDate,
					regularHours: 0,
					overtimeHours: otHours,
					hours: otHours,
					billRate: otRate,
					billAmount: otHours * otRate,
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.MANUAL,
					notes: `${tag}-OT`,
				},
				...(holidayPayCodeId
					? [
							{
								timesheetId: ts.id,
								organizationId: ts.organizationId,
								candidateId: ts.candidateId,
								placementId: ts.placementId ?? null,
								departmentId: ts.departmentId ?? null,
								locationId: ts.locationId ?? null,
								payCodeId: holidayPayCodeId,
								workDate: holDate,
								regularHours: holidayHours,
								overtimeHours: 0,
								hours: holidayHours,
								billRate: holRate,
								billAmount: holidayHours * holRate,
								status: TimesheetEntryStatus.APPROVED,
								dataSource: TimeEntryDataSource.MANUAL,
								notes: `${tag}-HOL`,
							},
						]
					: []),
			],
		});
	}

	const timesheetsWithEntries = await prisma.timesheet.findMany({
		where: { organizationId: orgId, entries: { some: {} } },
		select: {
			id: true,
			candidateId: true,
			placementId: true,
			weekEndingDate: true,
			entries: {
				select: {
					id: true,
					workDate: true,
					regularHours: true,
					overtimeHours: true,
					billRate: true,
					billAmount: true,
					payCode: { select: { code: true, category: true } },
				},
			},
		},
		orderBy: { weekEndingDate: "desc" },
		take: 40,
	});

	const richLinePool = timesheetsWithEntries
		.map((ts, idx) => {
			let regularHrs = 0;
			let otHrs = 0;
			let holidayHrs = 0;
			let amount = 0;
			let weightedRate = 0;
			let periodStart: Date | null = null;
			let periodEnd: Date | null = null;
			for (const e of ts.entries) {
				const isHoliday = isHolidayPayCode(
					e.payCode?.code,
					e.payCode?.category,
				);
				if (isHoliday) {
					holidayHrs +=
						Number(e.regularHours ?? 0) + Number(e.overtimeHours ?? 0);
				} else {
					regularHrs += Number(e.regularHours ?? 0);
					otHrs += Number(e.overtimeHours ?? 0);
				}
				const hours =
					Number(e.regularHours ?? 0) + Number(e.overtimeHours ?? 0);
				const rate = Number(e.billRate ?? 0);
				const rowAmount =
					Number(e.billAmount ?? 0) > 0
						? Number(e.billAmount ?? 0)
						: hours * rate;
				amount += rowAmount;
				weightedRate += rate * Math.max(hours, 0);
				if (!periodStart || e.workDate < periodStart) periodStart = e.workDate;
				if (!periodEnd || e.workDate > periodEnd) periodEnd = e.workDate;
			}
			const quantity = regularHrs + otHrs + holidayHrs;
			if (quantity <= 0) return null;
			const unitPrice =
				quantity > 0
					? Math.max(1, Math.round((amount / quantity) * 100) / 100)
					: Math.max(1, weightedRate / Math.max(1, quantity));
			return {
				description: `Clinical shift bundle #${idx + 1} (REG ${regularHrs.toFixed(1)}h, OT ${otHrs.toFixed(1)}h, HOL ${holidayHrs.toFixed(1)}h)`,
				quantity,
				unitPrice,
				amount: Math.round(amount * 100) / 100,
				lineType: "TIME_ENTRY",
				timesheetId: ts.id,
				candidateId: ts.candidateId,
				placementId: ts.placementId ?? null,
				periodStart: periodStart ?? ts.weekEndingDate,
				periodEnd: periodEnd ?? ts.weekEndingDate,
			};
		})
		.filter((v): v is NonNullable<typeof v> => Boolean(v));

	await prisma.invoice.deleteMany({
		where: {
			organizationId: orgId,
			invoiceNumber: { startsWith: INVOICE_PREFIX },
		},
	});

	const periodStart = new Date("2026-04-01T00:00:00.000Z");
	const periodEnd = new Date("2026-06-30T00:00:00.000Z");
	const invoiceDate = new Date("2026-04-10T00:00:00.000Z");
	const dueDate = new Date("2026-05-10T00:00:00.000Z");

	const commonHeader = {
		organizationId: orgId,
		vendorId,
		billToName: "Demo facility (seed)",
		billToAddress: "100 Seed St, Demo City",
		invoiceDate,
		dueDate,
		periodStartDate: periodStart,
		periodEndDate: periodEnd,
		paymentTerms: "net_30" as const,
		taxAmount: 0,
		discountAmount: 0,
		adjustmentAmount: 0,
	};

	const draftLines = [
		line("RN regular hours — week 1", 32, 85),
		line("RN overtime — week 1", 4, 127.5),
	];
	const draftSubtotal = draftLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}DRAFT-001`,
			subtotal: draftSubtotal,
			totalAmount: draftSubtotal,
			status: InvoiceStatus.DRAFT,
			lineItems: { create: draftLines },
		},
	});

	const subLines =
		richLinePool.slice(0, 5).length > 0
			? richLinePool.slice(0, 5)
			: [line("Clinical staffing — April (regular)", 120, 78)];
	const subTotal = subLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}SUBMITTED-001`,
			subtotal: subTotal,
			totalAmount: subTotal,
			status: InvoiceStatus.SUBMITTED,
			submittedById: actorId,
			submittedAt: new Date("2026-04-12T15:00:00.000Z"),
			reviewedById: actorId,
			reviewedAt: new Date("2026-04-13T10:00:00.000Z"),
			reviewNotes: "Seed review — looks good",
			lineItems: { create: subLines },
		},
	});

	let lineOffset = 5;
	for (let i = 2; i <= 10; i++) {
		const lines = richLinePool.slice(lineOffset, lineOffset + 3);
		if (!lines.length) break;
		lineOffset += 3;
		const subtotal = lines.reduce((s, l) => s + l.amount, 0);
		await prisma.invoice.create({
			data: {
				...commonHeader,
				invoiceNumber: `${INVOICE_PREFIX}SUBMITTED-${String(i).padStart(3, "0")}`,
				invoiceDate: new Date(
					`2026-04-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
				),
				dueDate: new Date(
					`2026-05-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
				),
				subtotal,
				totalAmount: subtotal,
				status: InvoiceStatus.SUBMITTED,
				submittedById: actorId,
				submittedAt: new Date(
					`2026-04-${String(10 + i).padStart(2, "0")}T15:00:00.000Z`,
				),
				lineItems: { create: lines },
			},
		});
	}

	for (let i = 1; i <= 4; i++) {
		const lines = richLinePool.slice(lineOffset, lineOffset + 2);
		if (!lines.length) break;
		lineOffset += 2;
		const subtotal = lines.reduce((s, l) => s + l.amount, 0);
		await prisma.invoice.create({
			data: {
				...commonHeader,
				invoiceNumber: `${INVOICE_PREFIX}DISPUTED-${String(i).padStart(3, "0")}`,
				invoiceDate: new Date(
					`2026-03-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
				),
				dueDate: new Date(
					`2026-04-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
				),
				subtotal,
				totalAmount: subtotal,
				status: InvoiceStatus.DISPUTED,
				submittedById: actorId,
				submittedAt: new Date(
					`2026-03-${String(10 + i).padStart(2, "0")}T15:00:00.000Z`,
				),
				lineItems: { create: lines },
			},
		});
	}

	const appLines = [line("Allied health — April bundle", 80, 62)];
	const appAmt = appLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}APPROVED-001`,
			subtotal: appAmt,
			totalAmount: appAmt,
			status: InvoiceStatus.APPROVED,
			submittedById: actorId,
			submittedAt: new Date("2026-04-05T12:00:00.000Z"),
			approvedById: actorId,
			approvedAt: new Date("2026-04-14T09:00:00.000Z"),
			approvalNotes: "Seed approval",
			lineItems: { create: appLines },
		},
	});

	const sentLines = [line("Per-diem pool — April", 60, 55)];
	const sentAmt = sentLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}SENT-001`,
			subtotal: sentAmt,
			totalAmount: sentAmt,
			status: InvoiceStatus.SENT,
			submittedById: actorId,
			submittedAt: new Date("2026-04-01T12:00:00.000Z"),
			approvedById: actorId,
			approvedAt: new Date("2026-04-02T09:00:00.000Z"),
			sentToClientAt: new Date("2026-04-15T14:00:00.000Z"),
			lineItems: { create: sentLines },
		},
	});

	const paidLines = [line("Final reconcile — Q2 seed", 40, 90)];
	const paidAmt = paidLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}PAID-001`,
			subtotal: paidAmt,
			totalAmount: paidAmt,
			amountPaid: paidAmt,
			status: InvoiceStatus.PAID,
			paidDate: new Date("2026-04-20T00:00:00.000Z"),
			paymentMethod: "ach",
			paymentReference: "SEED-ACH-001",
			submittedById: actorId,
			submittedAt: new Date("2026-04-08T12:00:00.000Z"),
			approvedById: actorId,
			approvedAt: new Date("2026-04-09T09:00:00.000Z"),
			sentToClientAt: new Date("2026-04-10T14:00:00.000Z"),
			lineItems: { create: paidLines },
		},
	});

	const overdueLines = [
		line("Aging seed invoice — disputed follow-up", 20, 100),
	];
	const overdueAmt = overdueLines.reduce((s, l) => s + l.amount, 0);

	await prisma.invoice.create({
		data: {
			...commonHeader,
			invoiceNumber: `${INVOICE_PREFIX}OVERDUE-001`,
			invoiceDate: new Date("2026-01-05T00:00:00.000Z"),
			dueDate: new Date("2026-02-04T00:00:00.000Z"),
			periodStartDate: new Date("2026-01-01T00:00:00.000Z"),
			periodEndDate: new Date("2026-01-31T00:00:00.000Z"),
			subtotal: overdueAmt,
			totalAmount: overdueAmt,
			status: InvoiceStatus.OVERDUE,
			submittedById: actorId,
			submittedAt: new Date("2026-01-08T12:00:00.000Z"),
			approvedById: actorId,
			approvedAt: new Date("2026-01-09T09:00:00.000Z"),
			sentToClientAt: new Date("2026-01-10T14:00:00.000Z"),
			lineItems: { create: overdueLines },
		},
	});

	console.log(
		`seedBillingDemo: invoices (${INVOICE_PREFIX}*) seeded for org ${orgId}`,
	);
}

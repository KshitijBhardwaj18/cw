import { InvoiceStatus } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { PLACEMENT_ID } from "./placements";
import { TIMESHEET_ID } from "./timekeeping";
import { VENDOR_ID } from "./vendors";

export const INVOICE_ID = {
	INV_001_DRAFT: getDeterministicId(`${SEED_PREFIX}inv-2025-001-draft`),
	INV_002_DRAFT: getDeterministicId(`${SEED_PREFIX}inv-2025-002-draft`),
	INV_003_DRAFT: getDeterministicId(`${SEED_PREFIX}inv-2025-003-draft`),
	INV_004_DRAFT: getDeterministicId(`${SEED_PREFIX}inv-2025-004-draft`),
	INV_003: getDeterministicId(`${SEED_PREFIX}inv-2026-003`),
	INV_004: getDeterministicId(`${SEED_PREFIX}inv-2026-004`),
	INV_005: getDeterministicId(`${SEED_PREFIX}inv-2026-005`),
	INV_006: getDeterministicId(`${SEED_PREFIX}inv-2026-006`),
	INV_007: getDeterministicId(`${SEED_PREFIX}inv-2026-007`),
	INV_008: getDeterministicId(`${SEED_PREFIX}inv-2026-008`),
	INV_009: getDeterministicId(`${SEED_PREFIX}inv-2026-009`),
	INV_010: getDeterministicId(`${SEED_PREFIX}inv-2026-010`),
} as const;

export interface InvoiceLineItemData {
	id: string;
	timesheetId?: string;
	description: string;
	quantity: number;
	unitPrice: number;
	amount?: number;
	candidateId?: string;
	placementId?: string;
	locationId?: string;
	departmentId?: string;
	lineType?: string;
	periodStart?: Date;
	periodEnd?: Date;
}

export interface InvoiceData {
	id: string;
	organizationId: string;
	vendorId: string;
	invoiceNumber: string;
	invoiceDate: Date;
	dueDate: Date;
	periodStartDate: Date;
	periodEndDate: Date;
	status: InvoiceStatus;
	totalAmount?: number;
	lineItems: InvoiceLineItemData[];
}

const generateHistory = (organizationId: string): InvoiceData[] => {
	const history: InvoiceData[] = [];
	const workers = [
		{
			id: CANDIDATE_ID.SARAH,
			placementId: PLACEMENT_ID.SARAH,
			vendorId: VENDOR_ID.CAREFIRST,
			name: "Sarah Johnson",
			rate: 80,
		},
		{
			id: CANDIDATE_ID.JAMES,
			placementId: PLACEMENT_ID.JAMES,
			vendorId: VENDOR_ID.MEDSTAFF,
			name: "James Wilson",
			rate: 110,
		},
		{
			id: CANDIDATE_ID.ELENA,
			placementId: PLACEMENT_ID.ELENA,
			vendorId: VENDOR_ID.GLOBAL,
			name: "Elena Rodriguez",
			rate: 95,
		},
		{
			id: CANDIDATE_ID.MARCUS,
			placementId: PLACEMENT_ID.MARCUS,
			vendorId: VENDOR_ID.ALLIED,
			name: "Marcus Bennett",
			rate: 105,
		},
	];

	const now = new Date();
	for (let i = 1; i <= 4; i++) {
		const weekEnding = new Date(now);
		weekEnding.setDate(now.getDate() - i * 7);

		const weekStart = new Date(weekEnding);
		weekStart.setDate(weekEnding.getDate() - 6);

		const month = weekEnding.getMonth();
		const multiplier = month === 11 || month === 0 ? 1.2 : 1.0;

		workers.forEach((worker) => {
			const invoiceNum = `HIST-${weekEnding.getFullYear()}-${(weekEnding.getMonth() + 1).toString().padStart(2, "0")}-${worker.id.slice(0, 4)}-${i}`;
			const invoiceId = getDeterministicId(
				`${SEED_PREFIX}inv-hist-${invoiceNum}`,
			);
			const timesheetId = getDeterministicId(
				`${SEED_PREFIX}ts-hist-${invoiceNum}`,
			);

			history.push({
				id: invoiceId,
				organizationId,
				vendorId: worker.vendorId,
				invoiceNumber: invoiceNum,
				invoiceDate: new Date(weekEnding.getTime() + 2 * 24 * 60 * 60 * 1000),
				dueDate: new Date(weekEnding.getTime() + 25 * 24 * 60 * 60 * 1000),
				periodStartDate: weekStart,
				periodEndDate: weekEnding,
				status: i <= 2 ? InvoiceStatus.SENT : InvoiceStatus.PAID,
				totalAmount: 0,
				lineItems: [
					{
						id: getDeterministicId(`${SEED_PREFIX}ili-hist-${invoiceNum}`),
						timesheetId: timesheetId,
						description: `Weekly Time Verification - ${worker.name}`,
						quantity: 40 * multiplier,
						unitPrice: worker.rate,
						amount: 0,
						candidateId: worker.id,
						placementId: worker.placementId,
					},
				],
			});
		});
	}

	return history;
};

export const getInvoicesDataset = (organizationId: string): InvoiceData[] => {
	const currentInvoices: InvoiceData[] = [
		{
			id: INVOICE_ID.INV_001_DRAFT,
			organizationId,
			vendorId: VENDOR_ID.MEDSTAFF,
			invoiceNumber: "INV-2025-001-DRAFT",
			invoiceDate: new Date("2025-01-16"),
			dueDate: new Date("2025-01-31"),
			periodStartDate: new Date("2025-01-01"),
			periodEndDate: new Date("2025-01-07"),
			status: InvoiceStatus.DRAFT,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-2025-001-1`),
					timesheetId: TIMESHEET_ID.JAMES_0315,
					description: "Weekly Time Verification - James Wilson",
					quantity: 40,
					unitPrice: 110,
					candidateId: CANDIDATE_ID.JAMES,
					placementId: PLACEMENT_ID.JAMES,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-2025-001-2`),
					timesheetId: TIMESHEET_ID.SARAH_0315,
					description: "Weekly Time Verification - Sarah Johnson",
					quantity: 40,
					unitPrice: 95,
					candidateId: CANDIDATE_ID.SARAH,
					placementId: PLACEMENT_ID.SARAH,
				},
			],
		},
		{
			id: INVOICE_ID.INV_002_DRAFT,
			organizationId,
			vendorId: VENDOR_ID.CAREFIRST,
			invoiceNumber: "INV-2025-002-DRAFT",
			invoiceDate: new Date("2025-01-16"),
			dueDate: new Date("2025-01-31"),
			periodStartDate: new Date("2025-01-01"),
			periodEndDate: new Date("2025-01-07"),
			status: InvoiceStatus.DRAFT,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-2025-002-1`),
					timesheetId: TIMESHEET_ID.ELENA_0315,
					description: "Weekly Time Verification - Elena Rodriguez",
					quantity: 40,
					unitPrice: 85,
					candidateId: CANDIDATE_ID.ELENA,
					placementId: PLACEMENT_ID.ELENA,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-2025-002-2`),
					timesheetId: TIMESHEET_ID.MARCUS_0315,
					description: "Weekly Time Verification - Marcus Bennett",
					quantity: 40,
					unitPrice: 105,
					candidateId: CANDIDATE_ID.MARCUS,
					placementId: PLACEMENT_ID.MARCUS,
				},
			],
		},
		{
			id: INVOICE_ID.INV_003_DRAFT,
			organizationId,
			vendorId: VENDOR_ID.ALLIED,
			invoiceNumber: "INV-2025-003-DRAFT",
			invoiceDate: new Date("2026-03-26"),
			dueDate: new Date("2026-04-10"),
			periodStartDate: new Date("2026-03-16"),
			periodEndDate: new Date("2026-03-22"),
			status: InvoiceStatus.DRAFT,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-2025-003-1`),
					timesheetId: TIMESHEET_ID.JAMES_0315,
					description: "Weekly Time Verification - James Wilson",
					quantity: 40,
					unitPrice: 88,
					candidateId: CANDIDATE_ID.JAMES,
					placementId: PLACEMENT_ID.JAMES,
				},
			],
		},
		{
			id: INVOICE_ID.INV_004,
			organizationId,
			vendorId: VENDOR_ID.CAREFIRST,
			invoiceNumber: "INV-2026-004",
			invoiceDate: new Date("2026-03-08"),
			dueDate: new Date("2026-04-07"),
			periodStartDate: new Date("2026-03-01"),
			periodEndDate: new Date("2026-03-07"),
			status: InvoiceStatus.SUBMITTED,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-004-1`),
					timesheetId: TIMESHEET_ID.SARAH_0315,
					description: "Weekly Time Verification - Sarah Johnson",
					quantity: 40,
					unitPrice: 95,
					candidateId: CANDIDATE_ID.SARAH,
					placementId: PLACEMENT_ID.SARAH,
				},
			],
		},
		{
			id: INVOICE_ID.INV_005,
			organizationId,
			vendorId: VENDOR_ID.GLOBAL,
			invoiceNumber: "INV-2026-005",
			invoiceDate: new Date("2026-03-22"),
			dueDate: new Date("2026-04-21"),
			periodStartDate: new Date("2026-03-08"),
			periodEndDate: new Date("2026-03-14"),
			status: InvoiceStatus.SUBMITTED,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-005-1`),
					timesheetId: TIMESHEET_ID.JAMES_0315,
					description: "Weekly Time Verification - James Wilson",
					quantity: 40,
					unitPrice: 110,
					candidateId: CANDIDATE_ID.JAMES,
					placementId: PLACEMENT_ID.JAMES,
				},
			],
		},
		{
			id: INVOICE_ID.INV_006,
			organizationId,
			vendorId: VENDOR_ID.ALLIED,
			invoiceNumber: "INV-2026-006",
			invoiceDate: new Date("2026-03-22"),
			dueDate: new Date("2026-04-21"),
			periodStartDate: new Date("2026-03-15"),
			periodEndDate: new Date("2026-03-21"),
			status: InvoiceStatus.SUBMITTED,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-006-1`),
					timesheetId: TIMESHEET_ID.ELENA_0301,
					description: "Weekly Time Verification - Elena Rodriguez",
					quantity: 40,
					unitPrice: 95,
					candidateId: CANDIDATE_ID.ELENA,
					placementId: PLACEMENT_ID.ELENA,
				},
			],
		},
		{
			id: INVOICE_ID.INV_003,
			organizationId,
			vendorId: VENDOR_ID.MEDSTAFF,
			invoiceNumber: "INV-2026-003",
			invoiceDate: new Date("2026-03-08"),
			dueDate: new Date("2026-03-31"),
			periodStartDate: new Date("2026-02-22"),
			periodEndDate: new Date("2026-02-28"),
			status: InvoiceStatus.DISPUTED,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-003-1`),
					timesheetId: TIMESHEET_ID.ISABELLE_0315,
					description: "Weekly Time Verification - Isabelle Green",
					quantity: 40,
					unitPrice: 95,
					candidateId: CANDIDATE_ID.ISABELLE,
					placementId: PLACEMENT_ID.ISABELLE,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-003-2`),
					timesheetId: TIMESHEET_ID.MARCUS_0315,
					description: "Weekly Time Verification - Marcus Bennett",
					quantity: 40,
					unitPrice: 95,
					candidateId: CANDIDATE_ID.MARCUS,
					placementId: PLACEMENT_ID.MARCUS,
				},
			],
		},
		{
			id: INVOICE_ID.INV_007,
			organizationId,
			vendorId: VENDOR_ID.MEDSTAFF,
			invoiceNumber: "INV-2026-007",
			invoiceDate: new Date("2026-04-16"),
			dueDate: new Date("2026-05-15"),
			periodStartDate: new Date("2026-04-01"),
			periodEndDate: new Date("2026-04-07"),
			status: InvoiceStatus.SENT,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-007-1`),
					timesheetId: TIMESHEET_ID.JAMES_0315,
					description: "Weekly Time Verification - James Wilson",
					quantity: 40,
					unitPrice: 90,
					candidateId: CANDIDATE_ID.JAMES,
					placementId: PLACEMENT_ID.JAMES,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-007-2`),
					timesheetId: TIMESHEET_ID.ISABELLE_0315,
					description: "Weekly Time Verification - Isabelle Green",
					quantity: 40,
					unitPrice: 90,
					candidateId: CANDIDATE_ID.ISABELLE,
					placementId: PLACEMENT_ID.ISABELLE,
				},
			],
		},
		{
			id: INVOICE_ID.INV_008,
			organizationId,
			vendorId: VENDOR_ID.CAREFIRST,
			invoiceNumber: "INV-2026-008",
			invoiceDate: new Date("2026-04-16"),
			dueDate: new Date("2026-05-15"),
			periodStartDate: new Date("2026-04-01"),
			periodEndDate: new Date("2026-04-07"),
			status: InvoiceStatus.SENT,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-008-1`),
					timesheetId: TIMESHEET_ID.SARAH_0315,
					description: "Weekly Time Verification - Sarah Johnson",
					quantity: 40,
					unitPrice: 80,
					candidateId: CANDIDATE_ID.SARAH,
					placementId: PLACEMENT_ID.SARAH,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-008-2`),
					timesheetId: TIMESHEET_ID.ELENA_0315,
					description: "Weekly Time Verification - Elena Rodriguez",
					quantity: 40,
					unitPrice: 80,
					candidateId: CANDIDATE_ID.ELENA,
					placementId: PLACEMENT_ID.ELENA,
				},
			],
		},
		{
			id: INVOICE_ID.INV_009,
			organizationId,
			vendorId: VENDOR_ID.GLOBAL,
			invoiceNumber: "INV-2026-009",
			invoiceDate: new Date("2026-04-09"),
			dueDate: new Date("2026-04-24"),
			periodStartDate: new Date("2026-03-25"),
			periodEndDate: new Date("2026-03-31"),
			status: InvoiceStatus.PAID,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-009-1`),
					timesheetId: TIMESHEET_ID.ELENA_0315,
					description: "Weekly Time Verification - Elena Rodriguez",
					quantity: 40,
					unitPrice: 107,
					candidateId: CANDIDATE_ID.ELENA,
					placementId: PLACEMENT_ID.ELENA,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-009-2`),
					timesheetId: TIMESHEET_ID.MARCUS_0315,
					description: "Weekly Time Verification - Marcus Bennett",
					quantity: 40,
					unitPrice: 107,
					candidateId: CANDIDATE_ID.MARCUS,
					placementId: PLACEMENT_ID.MARCUS,
				},
			],
		},
		{
			id: INVOICE_ID.INV_010,
			organizationId,
			vendorId: VENDOR_ID.ALLIED,
			invoiceNumber: "INV-2026-010",
			invoiceDate: new Date("2026-04-09"),
			dueDate: new Date("2026-04-24"),
			periodStartDate: new Date("2026-03-25"),
			periodEndDate: new Date("2026-03-31"),
			status: InvoiceStatus.PAID,
			lineItems: [
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-010-1`),
					timesheetId: TIMESHEET_ID.MARCUS_0315,
					description: "Weekly Time Verification - Marcus Bennett",
					quantity: 40,
					unitPrice: 93,
					candidateId: CANDIDATE_ID.MARCUS,
					placementId: PLACEMENT_ID.MARCUS,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}ili-010-2`),
					timesheetId: TIMESHEET_ID.SARAH_0315,
					description: "Weekly Time Verification - Sarah Johnson",
					quantity: 40,
					unitPrice: 93,
					candidateId: CANDIDATE_ID.SARAH,
					placementId: PLACEMENT_ID.SARAH,
				},
			],
		},
	];

	const history = generateHistory(organizationId);
	const allRawInvoices = [...currentInvoices, ...history];

	return allRawInvoices.map((inv) => {
		const lineItems = inv.lineItems.map((li) => ({
			...li,
			amount: li.quantity * li.unitPrice,
		}));

		const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);

		return {
			...inv,
			lineItems,
			totalAmount,
		} as InvoiceData;
	});
};

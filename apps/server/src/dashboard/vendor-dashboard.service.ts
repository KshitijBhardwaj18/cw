import { Injectable } from "@nestjs/common";
import {
	InvoiceStatus,
	PerDiemShiftStatus,
	PlacementStatus,
	Prisma,
	SubmissionStage,
} from "@repo/db";
import {
	addDays,
	differenceInCalendarDays,
	formatDistanceToNowStrict,
	startOfDay,
} from "date-fns";
import { PrismaService } from "src/prisma/prisma.service";

type VendorDashboardInvoiceBucket = "paid" | "pending" | "disputed";
type VendorDashboardAlertSeverity = "info" | "warning" | "error";

export type VendorDashboardResponse = {
	summary: {
		activeCandidates: number;
		activeCandidatesDelta: number;
		activePlacements: number;
		activePlacementsDelta: number;
		pendingSubmissions: number;
		openShifts: number;
		urgentOpenShifts: number;
	};
	performance: {
		fillRate: number;
		fillRateNumerator: number;
		fillRateDenominator: number;
		submissionToHireRatio: number | null;
		totalSubmissions: number;
		totalHires: number;
		placementSuccessRate: number;
		successfulPlacements: number;
		totalPlacements: number;
	};
	financial: {
		netInvoiceValue: number;
		paidAmount: number;
		pendingAmount: number;
		draftAmount: number;
	};
	invoiceStatus: Array<{
		label: string;
		value: number;
		status: VendorDashboardInvoiceBucket;
	}>;
	complianceAlerts: Array<{
		id: string;
		title: string;
		description: string;
		severity: VendorDashboardAlertSeverity;
	}>;
	recentActivity: Array<{
		id: string;
		title: string;
		description: string;
		time: string;
		severity: VendorDashboardAlertSeverity;
	}>;
	offers: {
		overdue: Array<{
			submissionId: string;
			name: string;
			jobTitle: string;
			location: string;
			salary: string;
			startDate: string;
			duration: string;
			overdueText: string;
			isOverdue: true;
		}>;
		pending: Array<{
			submissionId: string;
			name: string;
			jobTitle: string;
			location: string;
			salary: string;
			startDate: string;
			duration: string;
			postedTime: string;
			isOverdue?: false;
		}>;
	};
	upcomingShifts: Array<{
		id: string;
		role: string;
		urgency: "High" | "Medium" | "Low";
		facilityName: string;
		location: { city: string; state: string };
		requirements: string[];
		date: string;
		startTime: string;
		endTime: string;
		duration: string;
		billRate: string;
		openings: number;
	}>;
};

@Injectable()
export class VendorDashboardService {
	constructor(private readonly prisma: PrismaService) {}

	private formatMoney(amount: number | null | undefined): string {
		const safe = Number(amount ?? 0);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 2,
		}).format(safe);
	}

	private formatShortDate(date: Date | null | undefined): string {
		if (!date) return "TBD";
		return new Intl.DateTimeFormat("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
		}).format(date);
	}

	private formatTime(value: Date | string | null | undefined): string {
		if (!value) return "TBD";
		const date =
			value instanceof Date
				? value
				: new Date(`1970-01-01T${value.toString()}`);
		return new Intl.DateTimeFormat("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}).format(date);
	}

	private timeAgo(date: Date | null | undefined): string {
		if (!date) return "Recently";
		return formatDistanceToNowStrict(date, { addSuffix: true });
	}

	private shiftUrgency(isUrgent: boolean): "High" | "Medium" | "Low" {
		return isUrgent ? "High" : "Medium";
	}

	private offerDuration(
		lengthWeeks: number | null | undefined,
		startDate: Date | null | undefined,
		endDate: Date | null | undefined,
	): string {
		if (lengthWeeks && lengthWeeks > 0) return `${lengthWeeks} weeks`;
		if (startDate && endDate) {
			const days = Math.max(1, differenceInCalendarDays(endDate, startDate));
			const weeks = Math.max(1, Math.round(days / 7));
			return `${weeks} weeks`;
		}
		return "Open duration";
	}

	private offerPayLabel(
		billRate: Prisma.Decimal | number | null | undefined,
	): string {
		if (billRate == null) return "Rate TBD";
		return `${this.formatMoney(Number(billRate))}/hr`;
	}

	private complianceSeverity(
		daysRemaining: number,
		progress: number,
	): VendorDashboardAlertSeverity {
		if (daysRemaining <= 3 || progress < 50) return "error";
		if (daysRemaining <= 7 || progress < 100) return "warning";
		return "info";
	}

	async getSummary(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["summary"]> {
		const today = startOfDay(new Date());
		const weekAgo = addDays(today, -7);
		const monthAgo = addDays(today, -30);
		const [
			activeCandidates,
			newCandidatesThisWeek,
			activePlacements,
			newPlacementsThisMonth,
			pendingSubmissions,
			openShifts,
			urgentOpenShifts,
		] = await Promise.all([
			this.prisma.candidate.count({
				where: { organizationId, vendorId, isActive: true },
			}),
			this.prisma.candidate.count({
				where: { organizationId, vendorId, createdAt: { gte: weekAgo } },
			}),
			this.prisma.placement.count({
				where: {
					organizationId,
					candidate: { is: { vendorId } },
					status: { in: [PlacementStatus.ACTIVE, PlacementStatus.ENDING_SOON] },
				},
			}),
			this.prisma.placement.count({
				where: {
					organizationId,
					candidate: { is: { vendorId } },
					createdAt: { gte: monthAgo },
				},
			}),
			this.prisma.submission.count({
				where: {
					organizationId,
					vendorId,
					stage: SubmissionStage.SUBMITTED,
				},
			}),
			this.prisma.perDiemShift.count({
				where: {
					organizationId,
					isPublic: true,
					status: PerDiemShiftStatus.OPEN,
				},
			}),
			this.prisma.perDiemShift.count({
				where: {
					organizationId,
					isPublic: true,
					status: PerDiemShiftStatus.OPEN,
					isUrgent: true,
				},
			}),
		]);

		return {
			activeCandidates,
			activeCandidatesDelta: newCandidatesThisWeek,
			activePlacements,
			activePlacementsDelta: newPlacementsThisMonth,
			pendingSubmissions,
			openShifts,
			urgentOpenShifts,
		};
	}

	async getPerformance(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["performance"]> {
		const [submissionCounts, placementCounts] = await Promise.all([
			this.prisma.submission.groupBy({
				by: ["stage"],
				where: { organizationId, vendorId },
				_count: { _all: true },
			}),
			this.prisma.placement.groupBy({
				by: ["status"],
				where: {
					organizationId,
					candidate: { is: { vendorId } },
				},
				_count: { _all: true },
			}),
		]);

		const submissionCountByStage = new Map(
			submissionCounts.map((row) => [row.stage, row._count._all]),
		);
		const placementCountByStatus = new Map(
			placementCounts.map((row) => [row.status, row._count._all]),
		);

		const totalSubmissions = [...submissionCountByStage.values()].reduce(
			(sum, count) => sum + count,
			0,
		);
		const totalHires =
			submissionCountByStage.get(SubmissionStage.ACCEPTED) ?? 0;
		const fillRate =
			totalSubmissions > 0
				? Math.round((Number(totalHires) / totalSubmissions) * 1000) / 10
				: 0;
		const successfulPlacements =
			(placementCountByStatus.get(PlacementStatus.ACTIVE) ?? 0) +
			(placementCountByStatus.get(PlacementStatus.ENDING_SOON) ?? 0) +
			(placementCountByStatus.get(PlacementStatus.COMPLETED) ?? 0);
		const totalPlacements = [...placementCountByStatus.values()].reduce(
			(sum, count) => sum + count,
			0,
		);
		const placementSuccessRate =
			totalPlacements > 0
				? Math.round((successfulPlacements / totalPlacements) * 1000) / 10
				: 0;

		return {
			fillRate,
			fillRateNumerator: totalHires,
			fillRateDenominator: totalSubmissions,
			submissionToHireRatio:
				totalHires > 0
					? Math.round((totalSubmissions / Number(totalHires)) * 10) / 10
					: null,
			totalSubmissions,
			totalHires,
			placementSuccessRate,
			successfulPlacements,
			totalPlacements,
		};
	}

	private async getInvoiceAggregates(organizationId: string, vendorId: string) {
		const [invoiceStatusCounts, invoiceAmountRows] = await Promise.all([
			this.prisma.invoice.groupBy({
				by: ["status"],
				where: { organizationId, vendorId },
				_count: { _all: true },
			}),
			this.prisma.invoice.groupBy({
				by: ["status"],
				where: { organizationId, vendorId },
				_sum: { totalAmount: true },
			}),
		]);

		const countByStatus = new Map(
			invoiceStatusCounts.map((row) => [row.status, row._count._all]),
		);
		const amountByStatus = new Map(
			invoiceAmountRows.map((row) => [
				row.status,
				Number(row._sum.totalAmount ?? 0),
			]),
		);
		return { countByStatus, amountByStatus };
	}

	private mapFinancial(
		invoiceAmountByStatus: Map<InvoiceStatus, number>,
	): VendorDashboardResponse["financial"] {
		const paidAmount = invoiceAmountByStatus.get(InvoiceStatus.PAID) ?? 0;
		const disputedAmount =
			invoiceAmountByStatus.get(InvoiceStatus.DISPUTED) ?? 0;
		const pendingAmount =
			(invoiceAmountByStatus.get(InvoiceStatus.SUBMITTED) ?? 0) +
			(invoiceAmountByStatus.get(InvoiceStatus.APPROVED) ?? 0) +
			(invoiceAmountByStatus.get(InvoiceStatus.SENT) ?? 0) +
			(invoiceAmountByStatus.get(InvoiceStatus.OVERDUE) ?? 0);
		const draftAmount = invoiceAmountByStatus.get(InvoiceStatus.DRAFT) ?? 0;

		return {
			netInvoiceValue:
				paidAmount + pendingAmount + draftAmount + disputedAmount,
			paidAmount,
			pendingAmount,
			draftAmount,
		};
	}

	private mapInvoiceStatus(
		invoiceCountByStatus: Map<InvoiceStatus, number>,
	): VendorDashboardResponse["invoiceStatus"] {
		return [
			{
				label: "Paid",
				value: invoiceCountByStatus.get(InvoiceStatus.PAID) ?? 0,
				status: "paid",
			},
			{
				label: "Pending",
				value:
					(invoiceCountByStatus.get(InvoiceStatus.SUBMITTED) ?? 0) +
					(invoiceCountByStatus.get(InvoiceStatus.APPROVED) ?? 0) +
					(invoiceCountByStatus.get(InvoiceStatus.SENT) ?? 0) +
					(invoiceCountByStatus.get(InvoiceStatus.OVERDUE) ?? 0),
				status: "pending",
			},
			{
				label: "Disputed",
				value: invoiceCountByStatus.get(InvoiceStatus.DISPUTED) ?? 0,
				status: "disputed",
			},
		];
	}

	async getFinancial(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["financial"]> {
		const { amountByStatus } = await this.getInvoiceAggregates(
			organizationId,
			vendorId,
		);
		return this.mapFinancial(amountByStatus);
	}

	async getInvoiceStatus(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["invoiceStatus"]> {
		const { countByStatus } = await this.getInvoiceAggregates(
			organizationId,
			vendorId,
		);
		return this.mapInvoiceStatus(countByStatus);
	}

	async getComplianceAlerts(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["complianceAlerts"]> {
		const today = startOfDay(new Date());
		const rows = await this.prisma.placement.findMany({
			where: {
				organizationId,
				status: {
					in: [
						PlacementStatus.UPCOMING,
						PlacementStatus.PENDING,
						PlacementStatus.ON_HOLD,
					],
				},
				startDate: { gte: today, lte: addDays(today, 21) },
				candidate: { is: { vendorId } },
			},
			select: {
				id: true,
				startDate: true,
				jobTitle: true,
				candidate: {
					select: {
						user: { select: { name: true } },
					},
				},
				summary: {
					select: {
						complianceProgressCompleted: true,
						complianceProgressTotal: true,
					},
				},
			},
			orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
			take: 3,
		});

		return rows.map((row) => {
			const totalDocs = row.summary?.complianceProgressTotal ?? 0;
			const completedDocs = row.summary?.complianceProgressCompleted ?? 0;
			const progress =
				totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 100;
			const daysRemaining = row.startDate
				? Math.max(
						0,
						differenceInCalendarDays(startOfDay(row.startDate), today),
					)
				: 0;
			return {
				id: row.id,
				title: row.candidate.user.name?.trim() || "Upcoming placement",
				description: `${completedDocs}/${totalDocs} onboarding items complete${
					row.jobTitle ? ` for ${row.jobTitle}` : ""
				}${row.startDate ? ` starting ${this.formatShortDate(row.startDate)}` : ""}`,
				severity: this.complianceSeverity(daysRemaining, progress),
			};
		});
	}

	async getRecentActivity(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["recentActivity"]> {
		const [submissionActivities, placementActivities, invoiceActivities] =
			await Promise.all([
				this.prisma.submission.findMany({
					where: { organizationId, vendorId },
					select: {
						id: true,
						createdAt: true,
						candidate: { select: { user: { select: { name: true } } } },
						requisition: { select: { jobTitle: true, jobSummary: true } },
					},
					orderBy: { createdAt: "desc" },
					take: 3,
				}),
				this.prisma.placement.findMany({
					where: {
						organizationId,
						candidate: { is: { vendorId } },
					},
					select: {
						id: true,
						createdAt: true,
						candidate: { select: { user: { select: { name: true } } } },
						jobTitle: true,
					},
					orderBy: { createdAt: "desc" },
					take: 3,
				}),
				this.prisma.invoice.findMany({
					where: { organizationId, vendorId },
					select: {
						id: true,
						status: true,
						updatedAt: true,
						invoiceNumber: true,
						totalAmount: true,
					},
					orderBy: { updatedAt: "desc" },
					take: 3,
				}),
			]);

		return [
			...submissionActivities.map((row) => ({
				id: `submission:${row.id}`,
				at: row.createdAt,
				title: "Candidate Submitted",
				description: `${
					row.candidate.user.name?.trim() || "Candidate"
				} submitted for ${
					row.requisition.jobTitle?.trim() ||
					row.requisition.jobSummary?.trim() ||
					"open role"
				}`,
				severity: "info" as const,
			})),
			...placementActivities.map((row) => ({
				id: `placement:${row.id}`,
				at: row.createdAt,
				title: "Placement Created",
				description: `${
					row.candidate.user.name?.trim() || "Candidate"
				} placed in ${row.jobTitle?.trim() || "assignment"}`,
				severity: "warning" as const,
			})),
			...invoiceActivities.map((row) => ({
				id: `invoice:${row.id}`,
				at: row.updatedAt,
				title:
					row.status === InvoiceStatus.PAID
						? "Invoice Paid"
						: "Invoice Updated",
				description: `${row.invoiceNumber} - ${this.formatMoney(
					Number(row.totalAmount ?? 0),
				)}`,
				severity:
					row.status === InvoiceStatus.PAID
						? ("info" as const)
						: ("warning" as const),
			})),
		]
			.sort((a, b) => b.at.getTime() - a.at.getTime())
			.slice(0, 6)
			.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.description,
				time: this.timeAgo(item.at),
				severity: item.severity,
			}));
	}

	async getOffers(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse["offers"]> {
		const now = new Date();
		const offerRows = await this.prisma.submission.findMany({
			where: {
				organizationId,
				vendorId,
				stage: SubmissionStage.OFFERED,
			},
			select: {
				id: true,
				createdAt: true,
				stageEnteredAt: true,
				offerExtendedAt: true,
				candidate: { select: { user: { select: { name: true } } } },
				requisition: {
					select: {
						jobTitle: true,
						jobSummary: true,
						billRate: true,
						lengthWeeks: true,
						startDate: true,
						endDate: true,
						location: { select: { name: true } },
					},
				},
			},
			orderBy: [{ offerExtendedAt: "asc" }, { createdAt: "desc" }],
			take: 8,
		});

		const offerItems = offerRows.map((row) => {
			const occurredAt =
				row.offerExtendedAt ?? row.stageEnteredAt ?? row.createdAt;
			const isOverdue = occurredAt.getTime() <= addDays(now, -1).getTime();
			const overdueHours = Math.round(
				(now.getTime() - occurredAt.getTime()) / (1000 * 60 * 60),
			);
			return {
				submissionId: row.id,
				name: row.candidate.user.name?.trim() || "Candidate",
				jobTitle:
					row.requisition.jobTitle?.trim() ||
					row.requisition.jobSummary?.trim() ||
					"Open role",
				location: row.requisition.location?.name ?? "Location TBD",
				salary: this.offerPayLabel(row.requisition.billRate),
				startDate: this.formatShortDate(row.requisition.startDate),
				duration: this.offerDuration(
					row.requisition.lengthWeeks,
					row.requisition.startDate,
					row.requisition.endDate,
				),
				isOverdue,
				overdueText: `${Math.max(24, overdueHours)}h overdue`,
				postedTime: this.timeAgo(occurredAt),
			};
		});

		return {
			overdue: offerItems
				.filter((item) => item.isOverdue)
				.map((item) => ({
					submissionId: item.submissionId,
					name: item.name,
					jobTitle: item.jobTitle,
					location: item.location,
					salary: item.salary,
					startDate: item.startDate,
					duration: item.duration,
					overdueText: item.overdueText,
					isOverdue: true,
				})),
			pending: offerItems
				.filter((item) => !item.isOverdue)
				.map((item) => ({
					submissionId: item.submissionId,
					name: item.name,
					jobTitle: item.jobTitle,
					location: item.location,
					salary: item.salary,
					startDate: item.startDate,
					duration: item.duration,
					postedTime: item.postedTime,
				})),
		};
	}

	async getUpcomingShifts(
		organizationId: string,
	): Promise<VendorDashboardResponse["upcomingShifts"]> {
		const rows = await this.prisma.perDiemShift.findMany({
			where: {
				organizationId,
				isPublic: true,
				status: PerDiemShiftStatus.OPEN,
			},
			select: {
				id: true,
				isUrgent: true,
				shiftDate: true,
				startTime: true,
				endTime: true,
				totalShiftHours: true,
				vendorRate: true,
				occupation: { select: { name: true } },
				specialty: { select: { name: true } },
				department: { select: { name: true } },
				location: { select: { name: true, city: true, state: true } },
			},
			orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
			take: 20,
		});

		return rows.map((row) => ({
			id: row.id,
			role:
				row.occupation?.name?.trim() ||
				row.specialty?.name?.trim() ||
				"Open shift",
			urgency: this.shiftUrgency(row.isUrgent),
			facilityName: [row.location?.name, row.department?.name]
				.filter(Boolean)
				.join(" - "),
			location: {
				city: row.location?.city ?? "",
				state: row.location?.state ?? "",
			},
			requirements: [row.specialty?.name].filter((value): value is string =>
				Boolean(value?.trim()),
			),
			date: this.formatShortDate(row.shiftDate),
			startTime: this.formatTime(row.startTime),
			endTime: this.formatTime(row.endTime),
			duration: row.totalShiftHours
				? `${Number(row.totalShiftHours)} hours`
				: "TBD",
			billRate: this.offerPayLabel(row.vendorRate),
			openings: 1,
		}));
	}

	async getVendorDashboard(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDashboardResponse> {
		const [
			summary,
			performance,
			invoiceAggregates,
			complianceAlerts,
			recentActivity,
			offers,
			upcomingShifts,
		] = await Promise.all([
			this.getSummary(organizationId, vendorId),
			this.getPerformance(organizationId, vendorId),
			this.getInvoiceAggregates(organizationId, vendorId),
			this.getComplianceAlerts(organizationId, vendorId),
			this.getRecentActivity(organizationId, vendorId),
			this.getOffers(organizationId, vendorId),
			this.getUpcomingShifts(organizationId),
		]);

		return {
			summary,
			performance,
			financial: this.mapFinancial(invoiceAggregates.amountByStatus),
			invoiceStatus: this.mapInvoiceStatus(invoiceAggregates.countByStatus),
			complianceAlerts,
			recentActivity,
			offers,
			upcomingShifts,
		};
	}
}

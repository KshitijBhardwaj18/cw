import {
	GrievanceType,
	MetricKey,
	PlacementStatus,
	type PrismaClient,
	RequisitionStatus,
	RequisitionType,
	SubmissionStage,
} from "@repo/db";
import type {
	MetricSnapshotRecomputeJobResult,
	MetricSnapshotRecomputePayload,
} from "@repo/shared";

function safePercent(numerator: number, denominator: number): number {
	if (denominator <= 0) return 0;
	return (numerator / denominator) * 100;
}

function safeRatio(numerator: number, denominator: number): number {
	if (denominator <= 0) return 0;
	return numerator / denominator;
}

function daysBetween(from: Date, to: Date): number {
	return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
}

function startOfDayUtc(date: Date): Date {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

function startOfWeekUtc(date: Date): Date {
	const day = date.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	const d = new Date(date);
	d.setUTCDate(d.getUTCDate() + diff);
	return startOfDayUtc(d);
}

function startOfMonthUtc(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function resolvePeriod(payload: MetricSnapshotRecomputePayload): {
	periodStart: Date;
	periodEnd: Date;
} {
	if (payload.periodStart && payload.periodEnd) {
		return {
			periodStart: new Date(payload.periodStart),
			periodEnd: new Date(payload.periodEnd),
		};
	}
	const now = new Date();
	if (payload.periodType === "DAILY") {
		const periodStart = startOfDayUtc(now);
		const periodEnd = new Date(periodStart);
		periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);
		return { periodStart, periodEnd };
	}
	if (payload.periodType === "WEEKLY") {
		const periodStart = startOfWeekUtc(now);
		const periodEnd = new Date(periodStart);
		periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);
		return { periodStart, periodEnd };
	}
	const periodStart = startOfMonthUtc(now);
	const periodEnd = new Date(periodStart);
	periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
	return { periodStart, periodEnd };
}

async function computeMetric(
	prisma: PrismaClient,
	organizationId: string,
	metricKey: MetricKey,
	periodStart: Date,
	periodEnd: Date,
): Promise<{
	value: number;
	numerator?: number;
	denominator?: number;
	metadata?: object;
} | null> {
	switch (metricKey) {
		case MetricKey.REJECTION_PERCENTAGE: {
			const [totalSubmitted, rejectedApplicants] = await Promise.all([
				prisma.submission.count({
					where: {
						organizationId,
						submittedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.submission.count({
					where: {
						organizationId,
						stage: SubmissionStage.REJECTED,
						rejectedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
			]);
			return {
				value: safePercent(rejectedApplicants, totalSubmitted),
				numerator: rejectedApplicants,
				denominator: totalSubmitted,
			};
		}
		case MetricKey.FILL_RATE_LONG_TERM_REQS: {
			// Denominator: all LTO reqs that were active (published) before this period ended.
			// Numerator: those that moved to FILLED status within the period.
			// Both reference the same requisition lifecycle, keeping the rate in [0, 100].
			const [totalActive, filledCount] = await Promise.all([
				prisma.requisition.count({
					where: {
						organizationId,
						type: RequisitionType.LONG_TERM_ORDER,
						publishedAt: { lt: periodEnd },
						status: {
							notIn: [
								RequisitionStatus.DRAFT,
								RequisitionStatus.CANCELLED,
								RequisitionStatus.PENDING_APPROVAL,
							],
						},
					},
				}),
				prisma.requisition.count({
					where: {
						organizationId,
						type: RequisitionType.LONG_TERM_ORDER,
						status: RequisitionStatus.FILLED,
						updatedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
			]);
			return {
				value: safePercent(filledCount, totalActive),
				numerator: filledCount,
				denominator: totalActive,
			};
		}
		case MetricKey.FILL_RATE_SHIFTS: {
			// Denominator: shifts published in the period.
			// Numerator: of those shifts, how many were filled (IN_PROGRESS or COMPLETED).
			// Using shift status avoids the temporal mismatch of cross-period assignment timestamps.
			const [totalShifts, filledShifts] = await Promise.all([
				prisma.perDiemShift.count({
					where: {
						organizationId,
						publishedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.perDiemShift.count({
					where: {
						organizationId,
						publishedAt: { gte: periodStart, lt: periodEnd },
						status: { in: ["IN_PROGRESS", "COMPLETED"] },
					},
				}),
			]);
			return {
				value: safePercent(filledShifts, totalShifts),
				numerator: filledShifts,
				denominator: totalShifts,
			};
		}
		case MetricKey.SUBMIT_TO_OFFER_RATIO: {
			// submissions / offers = how many submits it takes to generate one offer.
			// Lower is better (goal e.g. 12 means ≤12 submits per offer). direction: lower_is_better.
			const [totalSubmissions, totalOffers] = await Promise.all([
				prisma.submission.count({
					where: {
						organizationId,
						submittedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.submission.count({
					where: {
						organizationId,
						offerExtendedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
			]);
			return {
				value: safeRatio(totalSubmissions, totalOffers),
				numerator: totalSubmissions,
				denominator: totalOffers,
			};
		}
		case MetricKey.AVG_TIME_TO_FIRST_SUBMISSION: {
			const requisitions = await prisma.requisition.findMany({
				where: {
					organizationId,
					publishedAt: { gte: periodStart, lt: periodEnd },
				},
				select: { id: true, publishedAt: true },
			});
			if (requisitions.length === 0) {
				return { value: 0, numerator: 0, denominator: 0 };
			}
			const firstSubmissionByReq = await prisma.submission.groupBy({
				by: ["requisitionId"],
				where: {
					organizationId,
					requisitionId: { in: requisitions.map((r) => r.id) },
				},
				_min: { submittedAt: true },
			});
			const firstMap = new Map(
				firstSubmissionByReq
					.filter((row) => row._min?.submittedAt != null)
					.map((row) => [row.requisitionId, row._min?.submittedAt as Date]),
			);
			let totalDays = 0;
			for (const req of requisitions) {
				if (!req.publishedAt) continue;
				const first = firstMap.get(req.id);
				if (!first) continue;
				totalDays += daysBetween(req.publishedAt, first);
			}
			// Denominator = only reqs that received at least one submission.
			// Reqs with no submissions are excluded so they don't pull the average toward 0.
			const recsWithSubmissions = firstMap.size;
			return {
				value: safeRatio(totalDays, recsWithSubmissions),
				numerator: totalDays,
				denominator: recsWithSubmissions,
			};
		}
		case MetricKey.AVG_TIME_PUBLISH_TO_ACCEPT: {
			const accepted = await prisma.submission.findMany({
				where: {
					organizationId,
					acceptedAt: { gte: periodStart, lt: periodEnd },
					requisition: { publishedAt: { not: null } },
				},
				select: {
					acceptedAt: true,
					requisition: { select: { publishedAt: true } },
				},
			});
			if (accepted.length === 0) {
				return { value: 0, numerator: 0, denominator: 0 };
			}
			let totalDays = 0;
			for (const row of accepted) {
				if (!row.acceptedAt || !row.requisition.publishedAt) continue;
				totalDays += daysBetween(row.requisition.publishedAt, row.acceptedAt);
			}
			return {
				value: safeRatio(totalDays, accepted.length),
				numerator: totalDays,
				denominator: accepted.length,
			};
		}
		case MetricKey.PERCENT_INCOMPLETE_ASSIGNMENTS: {
			const [totalAssignments, incompleteAssignments] = await Promise.all([
				prisma.placement.count({
					where: {
						organizationId,
						startDate: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.placement.count({
					where: {
						organizationId,
						startDate: { gte: periodStart, lt: periodEnd },
						// TERMINATED = ended before completion; UPCOMING/PENDING = not yet started
						status: {
							in: [
								PlacementStatus.TERMINATED,
								PlacementStatus.UPCOMING,
								PlacementStatus.PENDING,
							],
						},
					},
				}),
			]);
			return {
				value: safePercent(incompleteAssignments, totalAssignments),
				numerator: incompleteAssignments,
				denominator: totalAssignments,
			};
		}
		case MetricKey.EXPIRED_CREDENTIALING_PERCENT: {
			const [expiredCredentials, totalActiveWorkers] = await Promise.all([
				prisma.credentialExpirySummary.count({
					where: { organizationId, status: "EXPIRED" },
				}),
				prisma.placement.count({
					where: { organizationId, status: PlacementStatus.ACTIVE },
				}),
			]);
			return {
				value: safePercent(expiredCredentials, totalActiveWorkers),
				numerator: expiredCredentials,
				denominator: totalActiveWorkers,
			};
		}
		case MetricKey.ON_TIME_STARTS_PERCENT: {
			// Only count placements where acceptedAt is known — rows without it are excluded
			// from both numerator and denominator so they don't deflate the percentage.
			const starts = await prisma.placement.findMany({
				where: {
					organizationId,
					startDate: { gte: periodStart, lt: periodEnd },
					acceptedAt: { not: null },
				},
				select: { startDate: true, acceptedAt: true },
			});
			let onTime = 0;
			for (const row of starts) {
				if (!row.startDate || !row.acceptedAt) continue;
				if (row.acceptedAt.getTime() <= row.startDate.getTime()) onTime += 1;
			}
			return {
				value: safePercent(onTime, starts.length),
				numerator: onTime,
				denominator: starts.length,
			};
		}
		case MetricKey.BACK_OUT_PERCENTAGE: {
			// Cohort: submissions accepted in the period.
			// Numerator: of those, how many subsequently withdrew (at any point).
			// Using the same cohort for both keeps the rate meaningful and in [0, 100].
			const [totalAccepted, backedOut] = await Promise.all([
				prisma.submission.count({
					where: {
						organizationId,
						acceptedAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.submission.count({
					where: {
						organizationId,
						acceptedAt: { gte: periodStart, lt: periodEnd },
						withdrawnAt: { not: null },
					},
				}),
			]);
			return {
				value: safePercent(backedOut, totalAccepted),
				numerator: backedOut,
				denominator: totalAccepted,
			};
		}
		case MetricKey.PERFORMANCE_GRIEVANCE_PERCENT: {
			const [performanceGrievances, totalActiveWorkers] = await Promise.all([
				prisma.grievance.count({
					where: {
						organizationId,
						type: GrievanceType.BEHAVIORAL,
						createdAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.placement.count({
					where: { organizationId, status: PlacementStatus.ACTIVE },
				}),
			]);
			return {
				value: safePercent(performanceGrievances, totalActiveWorkers),
				numerator: performanceGrievances,
				denominator: totalActiveWorkers,
			};
		}
		case MetricKey.GRIEVANCE_PERCENTAGE: {
			const [totalGrievances, totalActiveWorkers] = await Promise.all([
				prisma.grievance.count({
					where: {
						organizationId,
						createdAt: { gte: periodStart, lt: periodEnd },
					},
				}),
				prisma.placement.count({
					where: { organizationId, status: PlacementStatus.ACTIVE },
				}),
			]);
			return {
				value: safePercent(totalGrievances, totalActiveWorkers),
				numerator: totalGrievances,
				denominator: totalActiveWorkers,
			};
		}
		default:
			return null;
	}
}

export async function runMetricSnapshotRecomputeProcessor(
	prisma: PrismaClient,
	payload: MetricSnapshotRecomputePayload,
): Promise<void> {
	if (!payload.organizationId) {
		const orgs = await prisma.organizationMetric.findMany({
			where: { isActive: true, metric: { status: true } },
			select: { organizationId: true },
			distinct: ["organizationId"],
		});
		for (const { organizationId } of orgs) {
			await runMetricSnapshotRecomputeProcessor(prisma, {
				...payload,
				organizationId,
			});
		}
		return;
	}

	const result: MetricSnapshotRecomputeJobResult = {
		periodType: payload.periodType,
		periodStart: "",
		periodEnd: "",
		computedCount: 0,
		skippedCount: 0,
		errors: [],
	};
	const { periodStart, periodEnd } = resolvePeriod(payload);
	result.periodStart = periodStart.toISOString();
	result.periodEnd = periodEnd.toISOString();

	const orgMetrics = await prisma.organizationMetric.findMany({
		where: {
			organizationId: payload.organizationId,
			isActive: true,
			metric: { status: true },
			...(payload.metricIds?.length
				? { metricId: { in: payload.metricIds } }
				: {}),
		},
		include: { metric: true },
	});

	for (const row of orgMetrics) {
		try {
			const computed = await computeMetric(
				prisma,
				payload.organizationId,
				row.metric.key,
				periodStart,
				periodEnd,
			);
			if (!computed) {
				result.skippedCount += 1;
				continue;
			}
			await prisma.organizationMetricSnapshot.upsert({
				where: {
					organizationId_metricId_periodType_periodStart_periodEnd: {
						organizationId: payload.organizationId,
						metricId: row.metricId,
						periodType: payload.periodType,
						periodStart,
						periodEnd,
					},
				},
				create: {
					organizationId: payload.organizationId,
					metricId: row.metricId,
					periodType: payload.periodType,
					periodStart,
					periodEnd,
					value: computed.value,
					numerator: computed.numerator ?? null,
					denominator: computed.denominator ?? null,
					...(computed.metadata
						? { metadata: computed.metadata as object }
						: {}),
				},
				update: {
					value: computed.value,
					numerator: computed.numerator ?? null,
					denominator: computed.denominator ?? null,
					...(computed.metadata
						? { metadata: computed.metadata as object }
						: {}),
					computedAt: new Date(),
				},
			});
			result.computedCount += 1;
		} catch (error) {
			result.errors.push({
				metricId: row.metricId,
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}

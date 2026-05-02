import { MetricKey, MetricSnapshotPeriodType, MetricType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const getMetricsDataset = () => {
	const metrics = [
		{
			key: MetricKey.REJECTION_PERCENTAGE,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Rejection Percentage",
			formula: "(Rejected Submissions / Total Submissions) * 100",
			goal: 15,
			currentValue: 12,
			isImproving: true,
		},
		{
			key: MetricKey.FILL_RATE_LONG_TERM_REQS,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Fill Rate (Long Term Reqs)",
			formula: "(Filled LTO Reqs / Total LTO Reqs) * 100",
			goal: 85,
			currentValue: 88,
			isImproving: true,
		},
		{
			key: MetricKey.FILL_RATE_SHIFTS,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Fill Rate (Shifts)",
			formula: "(Filled Shifts / Total Shifts) * 100",
			goal: 90,
			currentValue: 87,
			isImproving: false,
		},
		{
			key: MetricKey.SUBMIT_TO_OFFER_RATIO,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Submit to Offer Ratio",
			formula: "Total Offers / Total Submissions",
			goal: 0.3,
			currentValue: 0.28,
			isImproving: true,
		},
		{
			key: MetricKey.AVG_TIME_TO_FIRST_SUBMISSION,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Avg Time to 1st Submission",
			formula: "Average(First Submission Date - Publish Date)",
			goal: 3,
			currentValue: 2.5,
			isImproving: true,
		},
		{
			key: MetricKey.AVG_TIME_PUBLISH_TO_ACCEPT,
			type: MetricType.RECRUITMENT_EFFICIENCY,
			name: "Avg Time from Publish to Accept",
			formula: "Average(Accept Date - Publish Date)",
			goal: 14,
			currentValue: 12,
			isImproving: true,
		},
		{
			key: MetricKey.PERCENT_INCOMPLETE_ASSIGNMENTS,
			type: MetricType.COMPLIANCE,
			name: "Percent of Incomplete Assignments",
			formula: "(Incomplete Assignments / Total Assignments) * 100",
			goal: 5,
			currentValue: 3,
			isImproving: true,
		},
		{
			key: MetricKey.EXPIRED_CREDENTIALING_PERCENT,
			type: MetricType.COMPLIANCE,
			name: "Expired Credentialing %",
			formula: "(Expired Credentials / Total Credentials) * 100",
			goal: 5,
			currentValue: 1.5,
			isImproving: true,
		},
		{
			key: MetricKey.ON_TIME_STARTS_PERCENT,
			type: MetricType.COMPLIANCE,
			name: "On Time Starts %",
			formula: "(Starts on Date / Total Starts) * 100",
			goal: 95,
			currentValue: 96,
			isImproving: true,
		},
		{
			key: MetricKey.BACK_OUT_PERCENTAGE,
			type: MetricType.QUALITY_OF_SERVICE,
			name: "Back Out Percentage",
			formula: "(Back Outs / Total Placements) * 100",
			goal: 5,
			currentValue: 4,
			isImproving: true,
		},
		{
			key: MetricKey.PERFORMANCE_GRIEVANCE_PERCENT,
			type: MetricType.QUALITY_OF_SERVICE,
			name: "Performance Grievance %",
			formula: "(Clinical Grievances / Total Placements) * 100",
			goal: 3,
			currentValue: 2.5,
			isImproving: true,
		},
		{
			key: MetricKey.GRIEVANCE_PERCENTAGE,
			type: MetricType.QUALITY_OF_SERVICE,
			name: "Grievance Percentage",
			formula: "(Total Grievances / Total Placements) * 100",
			goal: 8,
			currentValue: 6,
			isImproving: true,
		},
	];

	const now = new Date();
	const results = [];

	for (const m of metrics) {
		const metricId = getDeterministicId(`${SEED_PREFIX}metric-${m.key}`);
		const snapshots = [];

		for (let i = 0; i < 30; i++) {
			const day = new Date(now);
			day.setDate(now.getDate() - i);
			day.setHours(0, 0, 0, 0);

			const dayEnd = new Date(day);
			dayEnd.setHours(23, 59, 59, 999);

			const variation = (Math.random() - 0.5) * 0.1 * m.currentValue;
			const trend = m.isImproving
				? (i / 30) * 0.05 * m.currentValue
				: -(i / 30) * 0.05 * m.currentValue;
			const value = Math.max(0, m.currentValue + variation + trend);

			snapshots.push({
				id: getDeterministicId(`${SEED_PREFIX}snapshot-${m.key}-d-${i}`),
				periodType: MetricSnapshotPeriodType.DAILY,
				periodStart: day,
				periodEnd: dayEnd,
				value: Number(value.toFixed(2)),
			});
		}

		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthEnd = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		);
		snapshots.push({
			id: getDeterministicId(`${SEED_PREFIX}snapshot-${m.key}-m-0`),
			periodType: MetricSnapshotPeriodType.MONTHLY,
			periodStart: monthStart,
			periodEnd: monthEnd,
			value: m.currentValue,
		});

		results.push({
			...m,
			id: metricId,
			snapshots,
		});
	}

	return results;
};

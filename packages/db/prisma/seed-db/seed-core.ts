import { MatchingCriterionKey, MetricKey, MetricType } from "@repo/db";
import { createPrismaClient } from "../../lib/create-prisma-client";

const prisma = createPrismaClient();

const SEED_USER = {
	email: "bala@heizen.work",
	name: "Bala Heizen",
	phoneNumber: "+1234567890",
	timeZone: "EASTERN",
	title: "Senior Software Engineer",
	officePhone: "+1234567890",
	status: "ACTIVE" as const,
	role: "SUPER_ADMIN" as const,
};

const CRITERIA: Array<{
	key: MatchingCriterionKey;
	name: string;
	description: string;
}> = [
	{
		key: MatchingCriterionKey.PREFERRED_LOCATION,
		name: "Preferred Location",
		description: "Match candidates based on their preferred work location",
	},
	{
		key: MatchingCriterionKey.SHIFT_TYPE,
		name: "Shift Type (Day/Night)",
		description: "Match candidates based on their preferred shift",
	},
	{
		key: MatchingCriterionKey.CONTRACT_LENGTH,
		name: "Contract Length",
		description:
			"Match candidates based on their availability for the contract duration",
	},
];

const METRICS = [
	{
		key: MetricKey.REJECTION_PERCENTAGE,
		name: "Rejection Percentage",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula: "(Rejected Applicants ÷ Total Submitted) × 100",
		status: true,
	},
	{
		key: MetricKey.FILL_RATE_LONG_TERM_REQS,
		name: "Fill Rate (Long Term Reqs)",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula: "(Filled Positions ÷ Total Open Positions) × 100",
		status: true,
	},
	{
		key: MetricKey.FILL_RATE_SHIFTS,
		name: "Fill Rate (Shifts)",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula: "(Filled Shifts ÷ Total Shift Openings) × 100",
		status: true,
	},
	{
		key: MetricKey.SUBMIT_TO_OFFER_RATIO,
		name: "Submit to Offer Ratio",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula: "Total Offers ÷ Total Submissions",
		status: true,
	},
	{
		key: MetricKey.AVG_TIME_TO_FIRST_SUBMISSION,
		name: "Avg Time to 1st Submission",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula: "Σ(Days from Posting to First Submission) ÷ Total Requisitions",
		status: true,
	},
	{
		key: MetricKey.AVG_TIME_PUBLISH_TO_ACCEPT,
		name: "Avg Time from Publish to Accept",
		type: MetricType.RECRUITMENT_EFFICIENCY,
		formula:
			"Σ(Days from Posting to Offer Acceptance) ÷ Total Filled Positions",
		status: true,
	},
	{
		key: MetricKey.PERCENT_INCOMPLETE_ASSIGNMENTS,
		name: "Percent of Incomplete Assignments",
		type: MetricType.COMPLIANCE,
		formula: "(Incomplete Assignments ÷ Total Assignments) × 100",
		status: true,
	},
	{
		key: MetricKey.EXPIRED_CREDENTIALING_PERCENT,
		name: "Expired Credentialing %",
		type: MetricType.COMPLIANCE,
		formula: "(Expired Credentials ÷ Total Active Workers) × 100",
		status: true,
	},
	{
		key: MetricKey.ON_TIME_STARTS_PERCENT,
		name: "On Time Starts %",
		type: MetricType.COMPLIANCE,
		formula: "(Assignments Started On Time ÷ Total Assignments) × 100",
		status: true,
	},
	{
		key: MetricKey.BACK_OUT_PERCENTAGE,
		name: "Back Out Percentage",
		type: MetricType.QUALITY_OF_SERVICE,
		formula: "(Candidates Who Backed Out ÷ Total Accepted Offers) × 100",
		status: true,
	},
	{
		key: MetricKey.PERFORMANCE_GRIEVANCE_PERCENT,
		name: "Performance Grievance %",
		type: MetricType.QUALITY_OF_SERVICE,
		formula: "(Performance-Related Grievances ÷ Total Active Workers) × 100",
		status: true,
	},
	{
		key: MetricKey.GRIEVANCE_PERCENTAGE,
		name: "Grievance Percentage",
		type: MetricType.QUALITY_OF_SERVICE,
		formula: "(Total Grievances ÷ Total Active Workers) × 100",
		status: true,
	},
];

async function run() {
	console.log("Seeding core user, matching criteria, and metrics...");
	await prisma.user.upsert({
		where: { email: SEED_USER.email },
		update: {
			name: SEED_USER.name,
			phoneNumber: SEED_USER.phoneNumber,
			timeZone: SEED_USER.timeZone,
			title: SEED_USER.title,
			officePhone: SEED_USER.officePhone,
			status: SEED_USER.status,
			role: SEED_USER.role,
		},
		create: {
			email: SEED_USER.email,
			name: SEED_USER.name,
			phoneNumber: SEED_USER.phoneNumber,
			timeZone: SEED_USER.timeZone,
			title: SEED_USER.title,
			officePhone: SEED_USER.officePhone,
			status: SEED_USER.status,
			role: SEED_USER.role,
			emailVerified: true,
		},
	});

	for (const item of CRITERIA) {
		await prisma.matchingCriterion.upsert({
			where: { key: item.key },
			update: { name: item.name, description: item.description },
			create: item,
		});
	}

	for (const item of METRICS) {
		await prisma.metric.upsert({
			where: { key: item.key },
			update: {
				name: item.name,
				type: item.type,
				formula: item.formula,
				status: item.status,
			},
			create: item,
		});
	}

	console.log("Core DB seed complete.");
}

run()
	.catch((error) => {
		console.error("Core DB seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

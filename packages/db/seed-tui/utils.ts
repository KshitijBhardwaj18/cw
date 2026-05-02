import { createHash } from "node:crypto";
import { SubmissionStage } from "@repo/db";

export const getDeterministicId = (key: string) => {
	const hash = createHash("sha256").update(key).digest();

	const bytes = Buffer.from(hash);

	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hex = bytes.toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export const SEED_PREFIX = "test-";
export const SEED_EMAIL_DOMAIN = "test.com";
export const SAMPLE_PDF_URL =
	"https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf";

export const isSeedData = (value: string) => {
	return value.startsWith(SEED_PREFIX) || value.endsWith(SEED_EMAIL_DOMAIN);
};

export const getSubmissionMilestones = (
	stage: SubmissionStage,
	baseDate: Date,
): Record<string, Date | null> => {
	const addDays = (date: Date, days: number) => {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	};

	const milestones: Record<string, Date | null> = {
		submittedAt: baseDate,
		qualifiedAt: null,
		shortlistedAt: null,
		interviewScheduledAt: null,
		interviewCompletedAt: null,
		offerExtendedAt: null,
		acceptedAt: null,
		withdrawnAt: null,
		rejectedAt: null,
		stageEnteredAt: baseDate,
	};

	if (stage === SubmissionStage.WITHDRAWN) {
		const withdrawnDate = addDays(baseDate, 1);
		milestones.withdrawnAt = withdrawnDate;
		milestones.stageEnteredAt = withdrawnDate;
		return milestones;
	}

	if (stage === SubmissionStage.REJECTED) {
		const rejectedDate = addDays(baseDate, 1);
		milestones.rejectedAt = rejectedDate;
		milestones.stageEnteredAt = rejectedDate;
		return milestones;
	}

	const sequence = [
		SubmissionStage.QUALIFIED,
		SubmissionStage.SHORTLISTED,
		SubmissionStage.INTERVIEW_SCHEDULED,
		SubmissionStage.INTERVIEW_COMPLETED,
		SubmissionStage.OFFERED,
		SubmissionStage.ACCEPTED,
	];

	const stageMap: Record<SubmissionStage, string> = {
		[SubmissionStage.QUALIFIED]: "qualifiedAt",
		[SubmissionStage.SHORTLISTED]: "shortlistedAt",
		[SubmissionStage.INTERVIEW_SCHEDULED]: "interviewScheduledAt",
		[SubmissionStage.INTERVIEW_COMPLETED]: "interviewCompletedAt",
		[SubmissionStage.OFFERED]: "offerExtendedAt",
		[SubmissionStage.ACCEPTED]: "acceptedAt",
		[SubmissionStage.SUBMITTED]: "submittedAt",
		[SubmissionStage.WITHDRAWN]: "withdrawnAt",
		[SubmissionStage.REJECTED]: "rejectedAt",
	};

	let currentOffset = 1;
	for (const s of sequence) {
		const milestoneDate = addDays(baseDate, currentOffset);
		milestones[stageMap[s]] = milestoneDate;
		currentOffset += 1;
		if (s === stage) {
			milestones.stageEnteredAt = milestoneDate;
			break;
		}
	}

	return milestones;
};

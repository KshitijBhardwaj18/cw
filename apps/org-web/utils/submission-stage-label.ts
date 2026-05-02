import { getLabel } from "@repo/shared";
import { SUBMISSION_STAGE_SELECT_OPTIONS } from "@/constants/submissions";

export function getSubmissionStageLabel(stage: string): string {
	return getLabel(SUBMISSION_STAGE_SELECT_OPTIONS, stage);
}

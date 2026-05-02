import { ConditionType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { TAG_ID } from "./tags";

export interface TaggingRuleData {
	id: string;
	ruleName: string;
	category: string;
	tagId: string;
	showOnSubmission: boolean;
	questions: {
		questionId: string;
		condition: ConditionType;
		triggerValue: string;
	}[];
}

export const getTaggingRulesDataset = (): TaggingRuleData[] => {
	const rules: TaggingRuleData[] = [
		{
			id: getDeterministicId(`${SEED_PREFIX}rule-icu-exp`),
			ruleName: "ICU Experience Tag",
			category: "Nursing",
			tagId: TAG_ID.ICU,
			showOnSubmission: true,
			questions: [
				{
					questionId: getDeterministicId(`${SEED_PREFIX}question-RN-specialty`),
					condition: ConditionType.EQUALS,
					triggerValue: "ICU",
				},
			],
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}rule-crrt-exp`),
			ruleName: "CRRT Experience Tag",
			category: "ICU",
			tagId: TAG_ID.CRITICAL_CARE,
			showOnSubmission: false,
			questions: [
				{
					questionId: getDeterministicId(`${SEED_PREFIX}question-ICU-crrt`),
					condition: ConditionType.EQUALS,
					triggerValue: "Yes",
				},
			],
		},
	];

	return rules;
};

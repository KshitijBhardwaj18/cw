import { QuestionType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import type { OccupationAcronym } from "./occupations";
import type { SpecialtyAcronym } from "./specialties";

export interface QuestionnaireData {
	id: string;
	occupationAcronym: OccupationAcronym | null;
	specialtyAcronym: SpecialtyAcronym | null;
	questions: {
		id: string;
		questionText: string;
		type: QuestionType;
		order: number;
	}[];
}

export const getQuestionnairesDataset = (): QuestionnaireData[] => {
	const questionnaires: QuestionnaireData[] = [
		{
			id: getDeterministicId(`${SEED_PREFIX}questionnaire-RN`),
			occupationAcronym: "RN",
			specialtyAcronym: null,
			questions: [
				{
					id: getDeterministicId(`${SEED_PREFIX}question-RN-specialty`),
					questionText: "What is your primary nursing specialty?",
					type: QuestionType.TEXT,
					order: 1,
				},
				{
					id: getDeterministicId(`${SEED_PREFIX}question-RN-license-states`),
					questionText: "In which states do you hold an active RN license?",
					type: QuestionType.TEXT,
					order: 2,
				},
			],
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}questionnaire-ICU`),
			occupationAcronym: null,
			specialtyAcronym: "ICU",
			questions: [
				{
					id: getDeterministicId(`${SEED_PREFIX}question-ICU-crrt`),
					questionText:
						"Do you have CRRT (Continuous Renal Replacement Therapy) experience?",
					type: QuestionType.TEXT,
					order: 1,
				},
			],
		},
	];

	return questionnaires;
};

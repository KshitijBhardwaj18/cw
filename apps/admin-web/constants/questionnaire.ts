import { QuestionType } from "@repo/shared";

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
	{ value: QuestionType.CHECKBOX, label: "Checkbox" },
	{ value: QuestionType.SELECT, label: "Select (Dropdown)" },
	{ value: QuestionType.RADIO_BUTTON, label: "Radio Button" },
	{ value: QuestionType.TEXT, label: "Text" },
];

export const QUESTION_TYPE_REQUIRES_OPTIONS: QuestionType[] = [
	QuestionType.CHECKBOX,
	QuestionType.SELECT,
	QuestionType.RADIO_BUTTON,
];

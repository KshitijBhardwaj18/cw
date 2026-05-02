import type { QuestionType } from "@repo/db";

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
	{ value: "CHECKBOX", label: "Checkbox" },
	{ value: "SELECT", label: "Select (Dropdown)" },
	{ value: "RADIO_BUTTON", label: "Radio Button" },
	{ value: "TEXT", label: "Text" },
];

export const QUESTION_TYPE_REQUIRES_OPTIONS: QuestionType[] = [
	"CHECKBOX",
	"SELECT",
	"RADIO_BUTTON",
];

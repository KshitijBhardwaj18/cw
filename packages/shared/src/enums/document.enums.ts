export const DocumentType = {
	LEGAL: "LEGAL",
	MARKETING: "MARKETING",
	FINANCE: "FINANCE",
	OTHERS: "OTHERS",
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const NoteType = {
	GENERAL: "GENERAL",
	BILLING: "BILLING",
	ISSUE: "ISSUE",
	REQUEST: "REQUEST",
	MEETING: "MEETING",
	FOLLOW_UP: "FOLLOW_UP",
} as const;
export type NoteType = (typeof NoteType)[keyof typeof NoteType];

export const NOTE_TYPE_OPTIONS = [
	{ value: NoteType.GENERAL, label: "General" },
	{ value: NoteType.BILLING, label: "Billing" },
	{ value: NoteType.ISSUE, label: "Issue" },
	{ value: NoteType.REQUEST, label: "Request" },
	{ value: NoteType.MEETING, label: "Meeting" },
	{ value: NoteType.FOLLOW_UP, label: "Follow Up" },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
	{ value: DocumentType.LEGAL, label: "Legal" },
	{ value: DocumentType.MARKETING, label: "Marketing" },
	{ value: DocumentType.FINANCE, label: "Finance" },
	{ value: DocumentType.OTHERS, label: "Others" },
] as const;

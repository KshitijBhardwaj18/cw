export const NOTE_COLUMN_KEYS = {
	organization: "organization",
	type: "type",
	date: "createdAt",
	authorName: "authorName",
	notes: "notes",
	actions: "actions",
} as const;

export const NOTE_COLUMN_HEADERS = {
	organization: "Organization",
	type: "Note Type",
	date: "Date",
	authorName: "Author Name",
	notes: "Note Message",
	actions: "Actions",
} as const;

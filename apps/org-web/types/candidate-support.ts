/** Contact methods shown on the candidate support page (provided by CMS/API when available). */
export type SupportContactChannel = {
	id: string;
	label: string;
	value: string;
};

export type SupportFaqCategoryId =
	| "all"
	| "applications"
	| "documents"
	| "timecards"
	| "profile"
	| "assignments"
	| "technical";

export type SupportFaqItem = {
	id: string;
	question: string;
	answer: string;
	categoryId: Exclude<SupportFaqCategoryId, "all">;
	categoryLabel: string;
};

export type SupportResourceLink = {
	id: string;
	title: string;
	description: string;
	href: string;
};

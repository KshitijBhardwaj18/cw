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

export const MOCK_SUPPORT_CONTACT_CHANNELS: readonly SupportContactChannel[] = [
	{
		id: "email",
		label: "Email Support",
		value: "support@example.com",
	},
	{
		id: "phone",
		label: "Phone Support",
		value: "(555) 123-4567",
	},
	{
		id: "chat",
		label: "Live Chat",
		value: "Mon–Fri 9AM–5PM ET",
	},
] as const;

export const MOCK_SUPPORT_FAQ_CATEGORIES: readonly {
	id: SupportFaqCategoryId;
	label: string;
}[] = [
	{ id: "all", label: "All Questions" },
	{ id: "applications", label: "Applications & Jobs" },
	{ id: "documents", label: "Documents & Compliance" },
	{ id: "timecards", label: "Timecards & Payments" },
	{ id: "profile", label: "Profile & Settings" },
	{ id: "assignments", label: "Assignments & Scheduling" },
	{ id: "technical", label: "Technical Support" },
] as const;

export const MOCK_SUPPORT_FAQ_ITEMS: readonly SupportFaqItem[] = [
	{
		id: "faq-apply",
		question: "How do I apply for a job?",
		categoryId: "applications",
		categoryLabel: "Applications & Jobs",
		answer:
			"Browse open jobs from the Matches & Job Search page, click on a job you're interested in, and click 'Apply Now'. Make sure all your compliance documents are uploaded before applying to ensure a smooth submission process.",
	},
	{
		id: "faq-approval-time",
		question: "How long does it take to get approved for a job?",
		categoryId: "applications",
		categoryLabel: "Applications & Jobs",
		answer:
			"Approval timelines vary by facility and role. You will receive status updates in your portal as your application moves through review.",
	},
	{
		id: "faq-multiple-assignments",
		question: "Can I work multiple assignments at once?",
		categoryId: "applications",
		categoryLabel: "Applications & Jobs",
		answer:
			"This depends on your employer's policies and any exclusivity in your contracts. Check with your recruiter or your facility contact for details.",
	},
	{
		id: "faq-submission-ready",
		question: "What does my 'Submission Ready Status' mean?",
		categoryId: "applications",
		categoryLabel: "Applications & Jobs",
		answer:
			"It indicates whether your profile and required documents meet the minimum requirements to submit to jobs. Complete any outstanding items before applying.",
	},
	{
		id: "faq-documents-needed",
		question: "What documents do I need to upload?",
		categoryId: "documents",
		categoryLabel: "Documents & Compliance",
		answer:
			"Required documents depend on your role and facility. Common items include licenses, certifications, immunizations, and identification. See your Document Wallet for specifics.",
	},
	{
		id: "faq-license-expires",
		question: "What if my license or certification expires?",
		categoryId: "documents",
		categoryLabel: "Documents & Compliance",
		answer:
			"Upload updated documents as soon as possible. Expired credentials may prevent you from applying or working until renewed.",
	},
	{
		id: "faq-bg-check",
		question:
			"Why don't I see Background Check or Drug Screening in my Document Wallet?",
		categoryId: "documents",
		categoryLabel: "Documents & Compliance",
		answer:
			"Some screenings are managed outside the portal or only appear after an employer initiates them. If you expect something to be listed, contact support with your assignment details.",
	},
] as const;

export const MOCK_SUPPORT_RESOURCES: readonly SupportResourceLink[] = [
	{
		id: "getting-started",
		title: "Getting Started Guide",
		description: "Learn how to use the Candidate Portal",
		href: "#",
	},
	{
		id: "document-requirements",
		title: "Document Requirements",
		description: "View all required compliance documents",
		href: "#",
	},
	{
		id: "timecard-instructions",
		title: "Timecard Instructions",
		description: "Step-by-step guide to submitting timecards",
		href: "#",
	},
	{
		id: "payment-faqs",
		title: "Payment FAQs",
		description: "Common questions about payments",
		href: "#",
	},
] as const;

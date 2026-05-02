import { Briefcase, Clock, FileText, UploadCloud } from "lucide-react";

export const SUBMISSION_READY_APPROVED_PCT = 80;
export const PRIORITY_READY_APPROVED_PCT = 90;

export const QUICK_ACTIONS = [
	{ label: "Browse Open Jobs", icon: Briefcase, href: "/matches" },
	{ label: "View Applications", icon: FileText, href: "/submissions" },
	{ label: "Upload Documents", icon: UploadCloud, href: "/document-wallet" },
	{ label: "Submit Timecard", icon: Clock, href: "/placements" },
];

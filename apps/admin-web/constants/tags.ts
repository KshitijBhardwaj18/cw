import type { TagType } from "@repo/db";

export const TAG_TYPE_OPTIONS: { value: TagType; label: string }[] = [
	{ value: "SKILL", label: "Skill" },
	{ value: "COMPLIANCE", label: "Compliance" },
	{ value: "AVAILABILITY", label: "Availability" },
	{ value: "PRIORITY", label: "Priority" },
	{ value: "FLAG", label: "Flag" },
];

import { TagType } from "@repo/shared";

export const TAG_TYPE_OPTIONS: { value: TagType; label: string }[] = [
	{ value: TagType.SKILL, label: "Skill" },
	{ value: TagType.COMPLIANCE, label: "Compliance" },
	{ value: TagType.AVAILABILITY, label: "Availability" },
	{ value: TagType.PRIORITY, label: "Priority" },
	{ value: TagType.FLAG, label: "Flag" },
];

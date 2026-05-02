import { TagStatus, TagType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const TAG_ID = {
	ICU: getDeterministicId(`${SEED_PREFIX}tag-icu`),
	CRITICAL_CARE: getDeterministicId(`${SEED_PREFIX}tag-critical-care`),
	EMERGENCY: getDeterministicId(`${SEED_PREFIX}tag-emergency`),
	TRAUMA: getDeterministicId(`${SEED_PREFIX}tag-trauma`),
	LEADERSHIP: getDeterministicId(`${SEED_PREFIX}tag-leadership`),
	REHAB: getDeterministicId(`${SEED_PREFIX}tag-rehab`),
	ORTHOPEDIC: getDeterministicId(`${SEED_PREFIX}tag-orthopedic`),
	ER: getDeterministicId(`${SEED_PREFIX}tag-er`),
	FLOAT_POOL: getDeterministicId(`${SEED_PREFIX}tag-float-pool`),
	SURGERY: getDeterministicId(`${SEED_PREFIX}tag-surgery`),
} as const;

export const getTagsDataset = () => {
	const tags = [
		{
			id: TAG_ID.ICU,
			name: "ICU",
			type: TagType.FLAG,
			description: "Intensive Care Unit specialist",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.CRITICAL_CARE,
			name: "Critical Care",
			type: TagType.FLAG,
			description: "Critical care certified",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.EMERGENCY,
			name: "Emergency",
			type: TagType.FLAG,
			description: "Emergency room experience",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.TRAUMA,
			name: "Trauma",
			type: TagType.FLAG,
			description: "Trauma center experience",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.LEADERSHIP,
			name: "Leadership",
			type: TagType.FLAG,
			description: "Management and leadership roles",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.REHAB,
			name: "Rehab",
			type: TagType.FLAG,
			description: "Rehabilitation experience",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.ORTHOPEDIC,
			name: "Orthopedic",
			type: TagType.FLAG,
			description: "Orthopedic specialty",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.ER,
			name: "ER",
			type: TagType.FLAG,
			description: "Emergency Room",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.FLOAT_POOL,
			name: "Float Pool",
			type: TagType.FLAG,
			description: "Float pool staff",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
		{
			id: TAG_ID.SURGERY,
			name: "Surgery",
			type: TagType.FLAG,
			description: "Surgical department experience",
			showOnSubmission: true,
			status: TagStatus.ACTIVE,
		},
	];

	return tags;
};

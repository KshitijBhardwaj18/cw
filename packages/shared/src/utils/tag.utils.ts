import type { TagType } from "../enums";
import type { TagResponseType } from "../types";

export function tagToFormValues(tag: TagResponseType) {
	return {
		name: tag.name,
		type: tag.type as TagType,
		description: tag.description ?? "",
		showOnSubmission: tag.showOnSubmission,
	};
}

import type { TagResponseType } from "../types";

export function tagToFormValues(tag: TagResponseType) {
	return {
		name: tag.name,
		type: tag.type,
		description: tag.description ?? "",
		showOnSubmission: tag.showOnSubmission,
	};
}

"use client";

import { useSearchParams } from "next/navigation";
import { JobsCreateEditPageContent } from "./JobsCreateEditPageContent";

export function JobsCreateWithPreset() {
	const searchParams = useSearchParams();
	const presetTemplateId = searchParams.get("templateId");
	return (
		<JobsCreateEditPageContent
			key={presetTemplateId ?? "new-job"}
			mode="create"
			presetTemplateId={presetTemplateId}
		/>
	);
}

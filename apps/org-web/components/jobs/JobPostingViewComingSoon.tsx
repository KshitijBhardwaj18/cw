"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { Construction } from "lucide-react";

interface JobPostingViewComingSoonProps {
	jobId: string;
}

export function JobPostingViewComingSoon({
	jobId,
}: JobPostingViewComingSoonProps) {
	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Job posting"
				total={0}
				itemLabel="job"
				itemLabelPlural="jobs"
				description="Overview and activity for this requisition"
				backLink={{ href: "/org/jobs", label: "Back to Jobs" }}
			/>

			<Empty className="border-muted/50 py-12">
				<EmptyHeader>
					<EmptyTitle className="flex items-center justify-center gap-2">
						<Construction className="text-muted-foreground size-5" />
						Coming soon
					</EmptyTitle>
					<EmptyDescription>
						A richer job overview is in development. You can still edit this
						posting from the jobs list.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>

			<p className="text-muted-foreground text-center text-xs">
				Reference ID: {jobId}
			</p>
		</div>
	);
}

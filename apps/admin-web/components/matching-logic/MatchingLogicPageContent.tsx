"use client";

import { useParams } from "next/navigation";
import MatchingLogicConfiguration from "./MatchingLogicConfiguration";

const MatchingLogicPageContent = () => {
	const params = useParams();
	const organizationId = params.organizationId as string;

	return (
		<div>
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Matching Logic Configuration</h1>
				<p className="text-muted-foreground text-sm">
					Configure how the system calculates candidate match percentages for
					your organization
				</p>
			</div>
			<MatchingLogicConfiguration organizationId={organizationId} />
		</div>
	);
};

export default MatchingLogicPageContent;

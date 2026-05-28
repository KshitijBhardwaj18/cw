"use client";

import { SupportAdditionalResourcesCard } from "@/components/candidate-support/SupportAdditionalResourcesCard";
import { SupportDirectAssistanceCard } from "@/components/candidate-support/SupportDirectAssistanceCard";
import { SupportFaqsCard } from "@/components/candidate-support/SupportFaqsCard";
import { SupportHeroCard } from "@/components/candidate-support/SupportHeroCard";

export function SupportPageContent() {
	return (
		<div className="space-y-8">
			<SupportHeroCard channels={[]} />
			<div id="direct-assistance">
				<SupportDirectAssistanceCard />
			</div>
			<SupportFaqsCard />
			<SupportAdditionalResourcesCard resources={[]} />
		</div>
	);
}

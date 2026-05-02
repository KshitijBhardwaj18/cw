"use client";

import {
	MOCK_SUPPORT_CONTACT_CHANNELS,
	MOCK_SUPPORT_RESOURCES,
} from "@/components/candidate-support/mock-candidate-support";
import { SupportAdditionalResourcesCard } from "@/components/candidate-support/SupportAdditionalResourcesCard";
import { SupportDirectAssistanceCard } from "@/components/candidate-support/SupportDirectAssistanceCard";
import { SupportFaqsCard } from "@/components/candidate-support/SupportFaqsCard";
import { SupportHeroCard } from "@/components/candidate-support/SupportHeroCard";

export function SupportPageContent() {
	return (
		<div className="space-y-8">
			<SupportHeroCard channels={MOCK_SUPPORT_CONTACT_CHANNELS} />
			<div id="direct-assistance">
				<SupportDirectAssistanceCard />
			</div>
			<SupportFaqsCard />
			<SupportAdditionalResourcesCard resources={MOCK_SUPPORT_RESOURCES} />
		</div>
	);
}

"use client";

import type { OnboardingWeekGroup } from "@/types/vendor-onboarding-tracker";
import { VendorOnboardingCandidateCard } from "./VendorOnboardingCandidateCard";

interface VendorOnboardingCandidateSectionProps {
	group: OnboardingWeekGroup;
	onSendReminder: (placementId: string) => void;
	isReminderPending: boolean;
}

export function VendorOnboardingCandidateSection({
	group,
	onSendReminder,
	isReminderPending,
}: VendorOnboardingCandidateSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg font-bold text-sm">
					{group.week === 0 ? "•" : group.week}
				</div>
				<div>
					<h2 className="text-xl font-bold">{group.label}</h2>
					<p className="text-sm text-muted-foreground">{group.description}</p>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				{group.candidates.map((candidate) => (
					<VendorOnboardingCandidateCard
						key={candidate.id}
						candidate={candidate}
						onSendReminder={onSendReminder}
						isReminderPending={isReminderPending}
					/>
				))}
			</div>
		</div>
	);
}

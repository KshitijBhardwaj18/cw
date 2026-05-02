"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";

interface OccupationStepFooterProps {
	onBack: () => void;
	onNext: () => void;
	isNextPending: boolean;
}

export function OccupationStepFooter({
	onBack,
	onNext,
	isNextPending,
}: OccupationStepFooterProps) {
	const router = useRouter();

	return (
		<div className="mt-8 flex items-center justify-between border-t pt-6">
			<Button type="button" variant="outline" onClick={onBack}>
				Back
			</Button>
			<div className="flex gap-3">
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push("/vendors")}
				>
					Cancel
				</Button>
				<Button type="button" onClick={onNext} disabled={isNextPending}>
					{isNextPending ? "Saving..." : "Save & Continue"}
				</Button>
			</div>
		</div>
	);
}

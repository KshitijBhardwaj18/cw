"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";

interface DocumentsStepFooterProps {
	onBack: () => void;
	onNext: () => void;
}

export function DocumentsStepFooter({
	onBack,
	onNext,
}: Readonly<DocumentsStepFooterProps>) {
	const router = useRouter();

	return (
		<div className="flex items-center justify-between">
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
				<Button type="button" onClick={onNext}>
					Continue
				</Button>
			</div>
		</div>
	);
}

"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";

interface VendorUsersStepFooterProps {
	onBack: () => void;
	onNext: () => void;
}

export function VendorUsersStepFooter({
	onBack,
	onNext,
}: Readonly<VendorUsersStepFooterProps>) {
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

"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";

interface NotesStepFooterProps {
	onBack: () => void;
	onFinish: () => void;
}

export function NotesStepFooter({
	onBack,
	onFinish,
}: Readonly<NotesStepFooterProps>) {
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
				<Button type="button" onClick={onFinish}>
					Finish
				</Button>
			</div>
		</div>
	);
}

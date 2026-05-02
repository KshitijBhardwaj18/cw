"use client";

import { Alert } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Loader2, X } from "lucide-react";
import type { BulkEnrollmentStatus } from "@/stores/bulk-enrollment.store";
import { getBulkEnrollmentAlertViewModel } from "@/utils/bulk-enrollment-banner";

type BulkEnrollmentAlertProps = {
	status: BulkEnrollmentStatus;
	onDismiss: () => void;
};

export function BulkEnrollmentAlert({
	status,
	onDismiss,
}: BulkEnrollmentAlertProps) {
	const model = getBulkEnrollmentAlertViewModel(status);
	if (!model) return null;

	return (
		<Alert
			className="flex items-center justify-between gap-3 border-primary/40 bg-primary/4 px-4 py-3"
			variant={model.variant === "destructive" ? "destructive" : undefined}
		>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				{model.showSpinner ? (
					<Loader2 className="size-5 shrink-0 animate-spin text-primary" />
				) : null}
				<span
					className={
						model.showSpinner
							? "text-sm font-medium text-foreground"
							: "text-sm text-foreground"
					}
				>
					{model.message}
				</span>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="shrink-0"
				onClick={onDismiss}
				aria-label="Dismiss"
			>
				<X className="size-4" />
			</Button>
		</Alert>
	);
}

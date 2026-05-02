import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { cva } from "class-variance-authority";
import { DOCUMENT_STATUS_CONFIG } from "@/constants/vendor/onboarding-tracker";
import type { OnboardingDocument } from "@/types/vendor-onboarding-tracker";

const documentIconVariants = cva(
	"flex size-9 items-center justify-center rounded",
	{
		variants: {
			status: {
				complete: "bg-emerald-50 text-emerald-600",
				pending: "bg-amber-50 text-amber-600",
				missing: "bg-rose-50 text-rose-600",
				"in-progress": "bg-amber-50 text-amber-600",
			},
		},
		defaultVariants: {
			status: "pending",
		},
	},
);

interface VendorOnboardingDocumentItemProps {
	document: OnboardingDocument;
}

export function VendorOnboardingDocumentItem({
	document,
}: VendorOnboardingDocumentItemProps) {
	const config = DOCUMENT_STATUS_CONFIG[document.status];
	const Icon = config.icon;

	return (
		<Card className="py-4">
			<CardContent className="flex items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<div className={documentIconVariants({ status: document.status })}>
						<Icon className="size-5" />
					</div>
					<div className="space-y-1.5">
						<h5 className="text-sm font-semibold leading-none">
							{document.name}
						</h5>
						<p className="text-xs text-muted-foreground font-medium">
							{document.uploadedDate
								? `Uploaded: ${document.uploadedDate}`
								: `Due: ${document.dueDate}`}
						</p>
					</div>
				</div>
				<Badge variant={config.variant}>{config.label}</Badge>
			</CardContent>
		</Card>
	);
}

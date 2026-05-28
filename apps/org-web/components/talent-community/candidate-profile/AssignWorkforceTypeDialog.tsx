"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	type CandidateWorkforceType,
	EXTERNAL_WORKFORCE_TYPES,
	INTERNAL_WORKFORCE_TYPES,
	isInternalWorkforceType,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OrgVendorOption } from "@/services/talent-community.service";

export function AssignWorkforceTypeDialog({
	open,
	onOpenChange,
	candidateName,
	vendors,
	initialWorkforceType = null,
	initialVendorId = null,
	isSubmitting = false,
	onAssign,
}: Readonly<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidateName: string;
	vendors: OrgVendorOption[];
	initialWorkforceType?: string | null;
	initialVendorId?: string | null;
	isSubmitting?: boolean;
	onAssign: (payload: {
		workforceType: CandidateWorkforceType;
		vendorId?: string;
	}) => void;
}>) {
	const [mode, setMode] = useState<"organization" | "vendor">("organization");
	const [vendorId, setVendorId] = useState<string>("");
	const [internalWorkforceType, setInternalWorkforceType] = useState<
		CandidateWorkforceType | ""
	>("");
	const [externalWorkforceType, setExternalWorkforceType] = useState<
		CandidateWorkforceType | ""
	>("");
	const isVendor = mode === "vendor";
	const internalWorkforceTypeOptions = useMemo(
		() =>
			CANDIDATE_WORKFORCE_TYPE_OPTIONS.filter((opt) =>
				(
					INTERNAL_WORKFORCE_TYPES as readonly CandidateWorkforceType[]
				).includes(opt.value),
			),
		[],
	);
	const externalWorkforceTypeOptions = useMemo(
		() =>
			CANDIDATE_WORKFORCE_TYPE_OPTIONS.filter((opt) =>
				(
					EXTERNAL_WORKFORCE_TYPES as readonly CandidateWorkforceType[]
				).includes(opt.value),
			),
		[],
	);
	const canSubmit = isVendor
		? Boolean(vendorId && externalWorkforceType)
		: Boolean(internalWorkforceType);

	useEffect(() => {
		if (!open) {
			return;
		}

		if (!initialWorkforceType) {
			setMode("organization");
			setVendorId("");
			setInternalWorkforceType("");
			setExternalWorkforceType("");
			return;
		}

		if (isInternalWorkforceType(initialWorkforceType)) {
			setMode("organization");
			setInternalWorkforceType(initialWorkforceType as CandidateWorkforceType);
			setExternalWorkforceType("");
			setVendorId("");
			return;
		}

		setMode("vendor");
		setExternalWorkforceType(initialWorkforceType as CandidateWorkforceType);
		setInternalWorkforceType("");
		setVendorId(initialVendorId ?? "");
	}, [open, initialWorkforceType, initialVendorId]);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next && isSubmitting) {
					return;
				}
				onOpenChange(next);
			}}
		>
			<DialogContent className="flex max-h-[min(95dvh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="border-border shrink-0 border-b px-6 pb-4 pt-6 text-left">
					<DialogTitle>Assign Workforce Type</DialogTitle>
					<DialogDescription className="sr-only">
						Choose a workforce type for this candidate
					</DialogDescription>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto px-6">
					<div className="space-y-6 py-4">
						<p className="text-muted-foreground text-sm">
							Select the workforce type for {candidateName}. This will determine
							their permissions and access level.
						</p>
						<div className="space-y-2">
							<Label className="text-sm font-medium">
								Workforce Type <span className="text-destructive">*</span>
							</Label>
							<RadioGroup
								value={mode}
								onValueChange={(value) =>
									setMode(value as "organization" | "vendor")
								}
								className="grid gap-3"
							>
								<label
									htmlFor="wt-org"
									className={cn(
										"flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
										mode === "organization" &&
											"border-primary ring-1 ring-primary/30",
									)}
								>
									<RadioGroupItem value="organization" id="wt-org" />
									<div className="space-y-1">
										<p className="font-semibold text-sm">
											Organization Candidate
										</p>
										<p className="text-muted-foreground text-xs">
											Direct hire candidate managed by your organization
										</p>
									</div>
								</label>
								<label
									htmlFor="wt-vendor"
									className={cn(
										"flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
										mode === "vendor" &&
											"border-primary ring-1 ring-primary/30",
									)}
								>
									<RadioGroupItem value="vendor" id="wt-vendor" />
									<div className="space-y-1">
										<p className="font-semibold text-sm">Vendor Candidate</p>
										<p className="text-muted-foreground text-xs">
											Candidate supplied by a third-party staffing vendor
										</p>
									</div>
								</label>
							</RadioGroup>
						</div>
						{!isVendor && (
							<div className="space-y-2 border-l-2 border-primary/50 pl-4">
								<Label className="text-sm font-medium">
									Select Internal Workforce Type{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Select
									value={internalWorkforceType}
									onValueChange={(value) =>
										setInternalWorkforceType(value as CandidateWorkforceType)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a type..." />
									</SelectTrigger>
									<SelectContent>
										{internalWorkforceTypeOptions.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-xs">
									The candidate will be associated with the selected internal
									workforce type.
								</p>
							</div>
						)}
						{isVendor && (
							<div className="space-y-4 border-l-2 border-primary/50 pl-4">
								<div className="space-y-2">
									<Label className="text-sm font-medium">
										Select Vendor <span className="text-destructive">*</span>
									</Label>
									<Select value={vendorId} onValueChange={setVendorId}>
										<SelectTrigger>
											<SelectValue placeholder="Select a vendor..." />
										</SelectTrigger>
										<SelectContent>
											{vendors.map((vendor) => (
												<SelectItem key={vendor.id} value={vendor.id}>
													{vendor.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-muted-foreground text-xs">
										The candidate will be associated with the selected vendor.
									</p>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium">
										Select External Workforce Type{" "}
										<span className="text-destructive">*</span>
									</Label>
									<Select
										value={externalWorkforceType}
										onValueChange={(value) =>
											setExternalWorkforceType(value as CandidateWorkforceType)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a type..." />
										</SelectTrigger>
										<SelectContent>
											{externalWorkforceTypeOptions.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-muted-foreground text-xs">
										The candidate will be classified under the selected external
										workforce type.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
				<DialogFooter className="border-border shrink-0 border-t bg-background px-6 py-4">
					<Button
						variant="outline"
						disabled={isSubmitting}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="gap-2"
						disabled={!canSubmit || isSubmitting}
						onClick={() => {
							void onAssign({
								workforceType: isVendor
									? (externalWorkforceType as CandidateWorkforceType)
									: (internalWorkforceType as CandidateWorkforceType),
								...(isVendor ? { vendorId } : {}),
							});
						}}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Assigning...
							</>
						) : (
							"Assign Workforce Type"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

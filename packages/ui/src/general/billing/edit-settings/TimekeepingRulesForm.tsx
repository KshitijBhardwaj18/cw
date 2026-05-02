"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import type { BillingFormState } from "../types";

interface TimekeepingRulesFormProps {
	state: BillingFormState;
	onChange: (patch: Partial<BillingFormState>) => void;
}

export function TimekeepingRulesForm({
	state,
	onChange,
}: TimekeepingRulesFormProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-foreground px-1">
				Timekeeping & Overtime Rules
			</h3>
			<Card>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="ot-threshold">Overtime Threshold (Hours)</Label>
						<div className="flex items-center gap-3">
							<Input
								id="ot-threshold"
								type="number"
								value={state.otThreshold}
								onChange={(e) =>
									onChange({ otThreshold: Number(e.target.value) })
								}
								className="w-24"
							/>
							<p className="text-sm text-muted-foreground">
								Hours worked beyond this threshold are billed at overtime rate
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Checkbox
							id="edit-ts-approval"
							className="mt-1"
							checked={state.timesheetApproval}
							onCheckedChange={(c) =>
								onChange({ timesheetApproval: Boolean(c) })
							}
						/>
						<div className="space-y-1">
							<Label htmlFor="edit-ts-approval">
								Timesheet Approval Required
							</Label>
							<p className="text-sm text-muted-foreground">
								Timesheets must be approved before invoicing
							</p>
						</div>
					</div>

					<div className="space-y-3">
						<Label>Time Entry Method</Label>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Checkbox
									id="mobile"
									checked={state.mobileEntry}
									onCheckedChange={(c) => onChange({ mobileEntry: Boolean(c) })}
								/>
								<Label htmlFor="mobile" className="font-normal text-sm">
									Mobile Entry
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="file-upload"
									checked={state.fileUpload}
									onCheckedChange={(c) => onChange({ fileUpload: Boolean(c) })}
								/>
								<Label htmlFor="file-upload" className="font-normal text-sm">
									File Upload
								</Label>
							</div>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Checkbox
							id="edit-dispute"
							className="mt-1"
							checked={state.disputeTracking}
							onCheckedChange={(c) => onChange({ disputeTracking: Boolean(c) })}
						/>
						<div className="space-y-1">
							<Label htmlFor="edit-dispute">Dispute Tracking Enabled</Label>
							<p className="text-sm text-muted-foreground">
								Track and manage billing disputes
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

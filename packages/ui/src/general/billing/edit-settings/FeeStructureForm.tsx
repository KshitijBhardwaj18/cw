"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import type { BillingFormState } from "../types";

interface FeeStructureFormProps {
	state: BillingFormState;
	onChange: (patch: Partial<BillingFormState>) => void;
}

export function FeeStructureForm({ state, onChange }: FeeStructureFormProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-foreground px-1">Fee Structure</h3>
			<Card>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="msp-fee">MSP Fee %</Label>
						<div className="flex items-center gap-3">
							<Input
								id="msp-fee"
								type="number"
								value={state.mspPercent}
								onChange={(e) =>
									onChange({ mspPercent: Number(e.target.value) })
								}
								className="w-24"
							/>
							<p className="text-sm text-muted-foreground">
								Managed Service Provider fee percentage
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="saas-fee">SAAS Fee %</Label>
						<div className="flex items-center gap-3">
							<Input
								id="saas-fee"
								type="number"
								value={state.saasPercent}
								onChange={(e) =>
									onChange({ saasPercent: Number(e.target.value) })
								}
								className="w-24"
							/>
							<p className="text-sm text-muted-foreground">
								Software as a Service platform fee percentage
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

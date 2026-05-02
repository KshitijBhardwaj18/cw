"use client";

import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import { Mail } from "lucide-react";
import type { BillingFormState } from "../types";

interface GeneralBillingFormProps {
	state: BillingFormState;
	onChange: (patch: Partial<BillingFormState>) => void;
}

export function GeneralBillingForm({
	state,
	onChange,
}: GeneralBillingFormProps) {
	const sameAsBilling = state.remittanceSameAsBilling;

	const billingAddrVal = sameAsBilling
		? {
				street: state.billingStreet,
				city: state.billingCity,
				stateCode: state.billingState,
				zip: state.billingZip,
			}
		: null;

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-foreground px-1">
				General Billing Information
			</h3>
			<Card>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							Client Billing ID
							<Badge variant="inactive">Read-only</Badge>
						</Label>
						<p className="text-sm font-semibold text-foreground">
							{state.clientBillingId || "—"}
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="billing-contact-name">Billing Contact Name</Label>
						<Input
							id="billing-contact-name"
							value={state.contactName}
							onChange={(e) => onChange({ contactName: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="billing-contact-email">
								Billing Contact Email
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									id="billing-contact-email"
									value={state.contactEmail}
									onChange={(e) => onChange({ contactEmail: e.target.value })}
									className="pl-9"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="billing-contact-phone">
								Billing Contact Phone
							</Label>
							<PhoneInput
								id="billing-contact-phone"
								value={state.contactPhone}
								onChange={(v) => onChange({ contactPhone: v || "" })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Billing Address</Label>
						<div className="space-y-3">
							<Input
								value={state.billingStreet}
								onChange={(e) => onChange({ billingStreet: e.target.value })}
								placeholder="Street Address"
							/>
							<div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
								<Input
									placeholder="City"
									className="sm:col-span-2"
									value={state.billingCity}
									onChange={(e) => onChange({ billingCity: e.target.value })}
								/>
								<Input
									placeholder="ST"
									value={state.billingState}
									onChange={(e) => onChange({ billingState: e.target.value })}
								/>
								<Input
									placeholder="Zip Code"
									className="sm:col-span-2"
									value={state.billingZip}
									onChange={(e) => onChange({ billingZip: e.target.value })}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>Remittance Address</Label>
							<div className="flex items-center gap-2">
								<Checkbox
									id="same-as-billing"
									checked={sameAsBilling}
									onCheckedChange={(c) =>
										onChange({ remittanceSameAsBilling: Boolean(c) })
									}
								/>
								<Label
									htmlFor="same-as-billing"
									className="text-sm font-normal"
								>
									Same as Billing Address
								</Label>
							</div>
						</div>
						<div className="space-y-3">
							<Input
								value={
									sameAsBilling ? state.billingStreet : state.remittanceStreet
								}
								onChange={(e) => onChange({ remittanceStreet: e.target.value })}
								placeholder="Street Address"
								disabled={sameAsBilling}
							/>
							<div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
								<Input
									placeholder="City"
									className="sm:col-span-2"
									value={
										sameAsBilling
											? (billingAddrVal?.city ?? "")
											: state.remittanceCity
									}
									onChange={(e) => onChange({ remittanceCity: e.target.value })}
									disabled={sameAsBilling}
								/>
								<Input
									placeholder="ST"
									value={
										sameAsBilling
											? (billingAddrVal?.stateCode ?? "")
											: state.remittanceState
									}
									onChange={(e) =>
										onChange({ remittanceState: e.target.value })
									}
									disabled={sameAsBilling}
								/>
								<Input
									placeholder="Zip Code"
									className="sm:col-span-2"
									value={
										sameAsBilling
											? (billingAddrVal?.zip ?? "")
											: state.remittanceZip
									}
									onChange={(e) => onChange({ remittanceZip: e.target.value })}
									disabled={sameAsBilling}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

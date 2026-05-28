"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import type { BillingFormState } from "../types";

interface InvoicePreferencesFormProps {
	state: BillingFormState;
	onChange: (patch: Partial<BillingFormState>) => void;
}

export function InvoicePreferencesForm({
	state,
	onChange,
}: Readonly<InvoicePreferencesFormProps>) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-foreground px-1">
				Invoice Preferences
			</h3>
			<Card>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label>Payment Terms</Label>
							<Select
								value={state.paymentTerms}
								onValueChange={(v) => onChange({ paymentTerms: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="net_15">Net 15</SelectItem>
									<SelectItem value="net_30">Net 30</SelectItem>
									<SelectItem value="net_45">Net 45</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-3">
							<Label>Invoice Delivery Method</Label>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Checkbox
										id="email"
										checked={state.deliveryEmail}
										onCheckedChange={(c) =>
											onChange({ deliveryEmail: Boolean(c) })
										}
									/>
									<Label htmlFor="email" className="font-normal text-sm">
										Email
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="sftp"
										checked={state.deliverySftp}
										onCheckedChange={(c) =>
											onChange({ deliverySftp: Boolean(c) })
										}
									/>
									<Label htmlFor="sftp" className="font-normal text-sm">
										SFTP Routing
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="download"
										checked={state.deliveryDownload}
										onCheckedChange={(c) =>
											onChange({ deliveryDownload: Boolean(c) })
										}
									/>
									<Label htmlFor="download" className="font-normal text-sm">
										Download Only
									</Label>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label>Invoice Grouping Method</Label>
							<Select
								value={state.invoiceGrouping}
								onValueChange={(v) => onChange({ invoiceGrouping: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="By Candidate">By Candidate</SelectItem>
									<SelectItem value="By Requisition">By Requisition</SelectItem>
									<SelectItem value="By Department">By Department</SelectItem>
									<SelectItem value="By Location">By Location</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Currency</Label>
							<Select
								value={state.currency}
								onValueChange={(v) => onChange({ currency: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USD">USD - US Dollar</SelectItem>
									<SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
									<SelectItem value="EUR">EUR - Euro</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label>Billing Frequency</Label>
							<Select
								value={state.billingFrequency}
								onValueChange={(v) => onChange({ billingFrequency: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="weekly">Weekly</SelectItem>
									<SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Billing Cycle Start Day</Label>
							<Select
								value={state.cycleStartDay}
								onValueChange={(v) => onChange({ cycleStartDay: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[
										"Monday",
										"Tuesday",
										"Wednesday",
										"Thursday",
										"Friday",
										"Saturday",
										"Sunday",
									].map((d) => (
										<SelectItem key={d} value={d}>
											{d}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

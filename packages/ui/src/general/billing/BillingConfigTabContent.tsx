"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { DetailItem } from "@repo/ui/components/detail-item";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CircleHelp, Mail, MapPin, Phone } from "lucide-react";
import { formatPhoneNumber } from "react-phone-number-input";
import type { BillingConfig, Holiday, PayCode } from "./types";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

function fmtDate(iso: string | null | undefined): string {
	if (!iso) return "";
	try {
		return DATE_FMT.format(new Date(iso));
	} catch {
		return iso ?? "";
	}
}

export interface BillingConfigTabContentProps {
	config?: BillingConfig | null;
	payCodes: PayCode[];
	holidays: Holiday[];
	isLoading?: boolean;
	payCodesLoading?: boolean;
	holidaysLoading?: boolean;
}

export function BillingConfigTabContent({
	config,
	payCodes,
	holidays,
	isLoading,
	payCodesLoading,
	holidaysLoading,
}: BillingConfigTabContentProps) {
	if (isLoading) {
		return (
			<div className="space-y-6">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader className="border-b">
							<Skeleton className="h-5 w-40" />
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">General Billing Information</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-12 sm:grid-cols-2">
					<div className="space-y-6">
						<DetailItem
							label="Client Billing ID"
							value={
								<div className="flex items-center gap-2">
									{config?.clientBillingId ?? "—"}
									<Badge variant="inactive" className="h-5 px-1.5 opacity-70">
										Read-only
									</Badge>
								</div>
							}
						/>
						<DetailItem
							label="Contact Name"
							value={config?.contactName || "—"}
						/>
						<DetailItem
							label="Email Address"
							value={
								config?.contactEmail ? (
									<div className="flex items-center gap-2">
										<Mail className="text-muted-foreground/70 size-4" />
										{config.contactEmail}
									</div>
								) : (
									"—"
								)
							}
						/>
						<DetailItem
							label="Phone Number"
							value={
								config?.contactPhone ? (
									<div className="flex items-center gap-2">
										<Phone className="text-muted-foreground/70 size-4" />
										{formatPhoneNumber(config.contactPhone) ||
											config.contactPhone}
									</div>
								) : (
									"—"
								)
							}
						/>
					</div>

					<div className="space-y-6">
						<DetailItem
							label="Billing Address"
							value={
								config?.billingStreet ? (
									<div className="flex items-start gap-2 leading-tight">
										<MapPin className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
										<div className="space-y-0.5">
											<p className="font-medium">{config.billingStreet}</p>
											<p>
												{config.billingCity}, {config.billingState}{" "}
												{config.billingZip}
											</p>
										</div>
									</div>
								) : (
									"—"
								)
							}
						/>
						<DetailItem
							label="Remittance"
							value={
								config?.remittanceStreet ? (
									<div className="flex items-start gap-2 leading-tight">
										<MapPin className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
										<div className="space-y-0.5">
											<p className="font-medium">{config.remittanceStreet}</p>
											<p>
												{config.remittanceCity}, {config.remittanceState}{" "}
												{config.remittanceZip}
											</p>
										</div>
									</div>
								) : (
									"—"
								)
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">Invoice Preferences</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
						{[
							{
								label: "Payment Terms",
								value: config?.paymentTerms ?? "—",
							},
							{
								label: "Delivery",
								value:
									[
										config?.invoiceDeliveryEmail && "Email",
										config?.invoiceDeliverySftp && "SFTP",
										config?.invoiceDeliveryDownload && "Download",
									]
										.filter(Boolean)
										.join(", ") || "—",
								hasHelp: true,
							},
							{
								label: "Grouping",
								value: config?.invoiceGrouping || "—",
							},
							{
								label: "Currency",
								value: config?.currency || "—",
								hasHelp: true,
							},
							{
								label: "Frequency",
								value: config?.billingFrequency ?? "—",
							},
							{
								label: "Cycle Start",
								value: config?.cycleStartDay || "—",
							},
						].map((pref) => (
							<DetailItem
								key={pref.label}
								label={pref.label}
								value={
									<div className="flex items-center gap-2">
										{pref.value}
										{pref.hasHelp && (
											<CircleHelp className="text-muted-foreground/30 size-3" />
										)}
									</div>
								}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">
						Timekeeping & Overtime Rules
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
						<DetailItem
							label="Overtime Threshold"
							value={
								<div className="space-y-1">
									<p className="text-sm font-medium text-foreground">
										{config?.otThreshold != null
											? `${config.otThreshold} hours/week`
											: "40 hours/week"}
									</p>
									<p className="text-muted-foreground text-xs leading-normal">
										Hours beyond this threshold billed at OT rate
									</p>
								</div>
							}
						/>
						<DetailItem
							label="Approval"
							value={
								<div className="flex items-start gap-4">
									<Checkbox
										checked={Boolean(config?.timesheetApproval)}
										onCheckedChange={() => {}}
										className="mt-0.5"
									/>
									<div className="space-y-1 leading-none">
										<p className="text-sm font-medium text-foreground">
											Timesheet Approval Required
										</p>
										<p className="text-muted-foreground text-xs leading-normal">
											Timesheets must be approved before invoicing
										</p>
									</div>
								</div>
							}
						/>
						<DetailItem
							label="Entry Method"
							value={
								<p className="text-sm font-medium text-foreground">
									{[
										config?.mobileEntry && "Mobile entry",
										config?.fileUpload && "File upload",
									]
										.filter(Boolean)
										.join(", ") || "—"}
								</p>
							}
						/>
						<DetailItem
							label="Dispute"
							value={
								<div className="flex items-start gap-4">
									<Checkbox
										checked={Boolean(config?.disputeTracking)}
										onCheckedChange={() => {}}
										className="mt-0.5"
									/>
									<div className="space-y-1 leading-none">
										<p className="text-sm font-medium text-foreground">
											Dispute Tracking Enabled
										</p>
										<p className="text-muted-foreground text-xs leading-normal">
											Track and manage billing disputes
										</p>
									</div>
								</div>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">Fee Structure</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-12 sm:grid-cols-2">
					<DetailItem
						label="MSP Fee %"
						value={
							<div className="space-y-1">
								<p className="text-xl font-medium text-foreground">
									{config?.mspPercent != null ? `${config.mspPercent}%` : "—"}
								</p>
								<p className="text-muted-foreground text-xs leading-normal">
									Managed Service Provider fee percentage
								</p>
							</div>
						}
					/>
					<DetailItem
						label="SAAS Fee %"
						value={
							<div className="space-y-1">
								<p className="text-xl font-medium text-foreground">
									{config?.saasPercent != null ? `${config.saasPercent}%` : "—"}
								</p>
								<p className="text-muted-foreground text-xs leading-normal">
									Software as a Service platform fee percentage
								</p>
							</div>
						}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">
						Financial Tables & Allocation
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-12">
					<DetailItem
						label="Pay Code Multipliers"
						value={
							payCodesLoading ? (
								<div className="space-y-2 mt-1">
									<Skeleton className="h-5 w-full" />
									<Skeleton className="h-5 w-4/5" />
								</div>
							) : payCodes.length > 0 ? (
								<div className="space-y-0 text-sm mt-1">
									{payCodes.map((item, i) => (
										<div key={item.id || item.code} className="flex flex-col">
											<div className="flex items-center justify-between py-2">
												<span className="text-foreground font-medium">
													{item.code} - {item.description}
												</span>
												<span className="font-medium text-foreground">
													{item.multiplier != null
														? `${item.multiplier}x`
														: "1x"}
												</span>
											</div>
											{i < payCodes.length - 1 && (
												<Separator className="bg-muted-foreground/10" />
											)}
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground mt-1">
									No pay codes configured
								</p>
							)
						}
					/>

					<DetailItem
						label="Client Cost Centers"
						value={
							<p className="text-sm text-muted-foreground mt-1">
								Not configured
							</p>
						}
					/>

					<DetailItem
						label="Holidays Table"
						value={
							<div className="mt-1">
								<ScrollArea className="h-[240px] pr-4">
									<div className="space-y-0 text-sm">
										{holidaysLoading ? (
											<div className="space-y-2">
												<Skeleton className="h-5 w-full" />
												<Skeleton className="h-5 w-4/5" />
												<Skeleton className="h-5 w-3/5" />
											</div>
										) : holidays.length > 0 ? (
											holidays.map((item, i) => (
												<div
													key={item.id || item.name}
													className="flex flex-col"
												>
													<div className="flex items-center justify-between py-3">
														<span className="text-foreground font-medium">
															{item.name}
														</span>
														<div className="flex items-center gap-3">
															<span className="text-muted-foreground/70">
																{fmtDate(item.observedOn)}
															</span>
															<Badge variant="success">
																{item.holidayType ?? "Paid"}
															</Badge>
														</div>
													</div>
													{i < holidays.length - 1 && (
														<Separator className="bg-muted-foreground/10" />
													)}
												</div>
											))
										) : (
											<p className="text-muted-foreground py-4 text-center">
												No holidays configured
											</p>
										)}
									</div>
								</ScrollArea>
							</div>
						}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

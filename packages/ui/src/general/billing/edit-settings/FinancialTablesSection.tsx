"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { HolidayFormItem, PayCodeFormItem } from "../types";

function toDateInputValue(iso: string | undefined): string {
	if (!iso) return "";
	const d = iso.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
	try {
		return new Date(iso).toISOString().slice(0, 10);
	} catch {
		return "";
	}
}

interface FinancialTablesSectionProps {
	payCodes: PayCodeFormItem[];
	onPayCodesChange: (payCodes: PayCodeFormItem[]) => void;
	holidays: HolidayFormItem[];
	onHolidaysChange: (holidays: HolidayFormItem[]) => void;
	costCenters: string[];
	onCostCentersChange: (costCenters: string[]) => void;
	isLoading?: boolean;
	canAddPayCode?: boolean;
	canEditPayCode?: boolean;
	canDeletePayCode?: boolean;
	canAddHoliday?: boolean;
	canEditHoliday?: boolean;
	canDeleteHoliday?: boolean;
}

export function FinancialTablesSection({
	payCodes,
	onPayCodesChange,
	holidays,
	onHolidaysChange,
	costCenters,
	onCostCentersChange,
	isLoading = false,
	canAddPayCode = true,
	canEditPayCode = true,
	canDeletePayCode = true,
	canAddHoliday = true,
	canEditHoliday = true,
	canDeleteHoliday = true,
}: Readonly<FinancialTablesSectionProps>) {
	const [showAddPayCode, setShowAddPayCode] = useState(false);
	const [newCode, setNewCode] = useState("");
	const [newCodeDesc, setNewCodeDesc] = useState("");
	const [newCodeMult, setNewCodeMult] = useState("");

	const [showAddHoliday, setShowAddHoliday] = useState(false);
	const [newHolidayName, setNewHolidayName] = useState("");
	const [newHolidayDate, setNewHolidayDate] = useState("");
	const [newHolidayType, setNewHolidayType] = useState("Paid");

	const [newCostCenter, setNewCostCenter] = useState("");

	const patchPayCode = (index: number, patch: Partial<PayCodeFormItem>) => {
		onPayCodesChange(
			payCodes.map((p, i) => (i === index ? { ...p, ...patch } : p)),
		);
	};

	const patchHoliday = (index: number, patch: Partial<HolidayFormItem>) => {
		onHolidaysChange(
			holidays.map((h, i) => (i === index ? { ...h, ...patch } : h)),
		);
	};

	const parseMultiplier = (raw: string): number | null => {
		const t = raw.trim();
		if (t === "") return null;
		const n = Number(t);
		return Number.isFinite(n) ? n : null;
	};

	const handleAddPayCode = () => {
		if (!newCode.trim() || !newCodeDesc.trim()) {
			toast.error("Code and description are required");
			return;
		}
		onPayCodesChange([
			...payCodes,
			{
				code: newCode.trim().toUpperCase(),
				description: newCodeDesc.trim(),
				category: "general",
				multiplier: newCodeMult ? Number(newCodeMult) : null,
			},
		]);
		setNewCode("");
		setNewCodeDesc("");
		setNewCodeMult("");
		setShowAddPayCode(false);
	};

	const handleDeletePayCode = (index: number) => {
		onPayCodesChange(payCodes.filter((_, i) => i !== index));
	};

	const handleAddHoliday = () => {
		if (!newHolidayName.trim() || !newHolidayDate) {
			toast.error("Name and date are required");
			return;
		}
		onHolidaysChange([
			...holidays,
			{
				name: newHolidayName.trim(),
				observedOn: newHolidayDate,
				holidayType: newHolidayType,
			},
		]);
		setNewHolidayName("");
		setNewHolidayDate("");
		setNewHolidayType("Paid");
		setShowAddHoliday(false);
	};

	const handleDeleteHoliday = (index: number) => {
		onHolidaysChange(holidays.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-foreground px-1">
				Financial Tables & Allocation
			</h3>
			<Card>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>Pay Codes</Label>
							{canAddPayCode && (
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setShowAddPayCode((v) => !v)}
								>
									<Plus className="size-4" />
									Add Pay Code
								</Button>
							)}
						</div>

						<div className="space-y-2">
							{isLoading ? (
								<>
									<Skeleton className="h-9 w-full" />
									<Skeleton className="h-9 w-5/6" />
								</>
							) : (
								<>
									{payCodes.map((item, i) => (
										<div
											key={item.id ?? `new-${i}`}
											className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
										>
											{canEditPayCode ? (
												<>
													<Input
														value={item.code}
														onChange={(e) =>
															patchPayCode(i, {
																code: e.target.value.toUpperCase(),
															})
														}
														className="h-9 w-20 shrink-0 text-center font-mono text-sm uppercase"
														aria-label="Pay code"
													/>
													<Input
														value={item.description}
														onChange={(e) =>
															patchPayCode(i, {
																description: e.target.value,
															})
														}
														className="h-9 min-w-0 flex-1 text-sm"
														placeholder="Description"
														aria-label="Description"
													/>
													<Input
														value={
															item.multiplier === null ||
															item.multiplier === undefined
																? ""
																: String(item.multiplier)
														}
														onChange={(e) =>
															patchPayCode(i, {
																multiplier: parseMultiplier(e.target.value),
															})
														}
														type="number"
														step="0.25"
														className="h-9 w-20 shrink-0 text-center text-sm"
														placeholder="1"
														aria-label="Multiplier"
													/>
												</>
											) : (
												<p className="text-sm">
													<span className="font-mono font-medium">
														{item.code}
													</span>
													{" — "}
													{item.description}
													{item.multiplier != null
														? ` (${item.multiplier}x)`
														: ""}
												</p>
											)}
											{canDeletePayCode && (
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
													onClick={() => handleDeletePayCode(i)}
												>
													<Trash2 className="size-4" />
												</Button>
											)}
										</div>
									))}
									{payCodes.length === 0 && !showAddPayCode && (
										<p className="text-sm text-muted-foreground">
											No pay codes configured.
										</p>
									)}
								</>
							)}
						</div>

						{canAddPayCode && showAddPayCode && (
							<div className="flex flex-wrap items-center gap-2 rounded border border-dashed p-3 sm:flex-nowrap">
								<Input
									value={newCode}
									onChange={(e) => setNewCode(e.target.value)}
									placeholder="Code"
									className="h-9 w-20 text-center font-mono uppercase"
								/>
								<Input
									value={newCodeDesc}
									onChange={(e) => setNewCodeDesc(e.target.value)}
									placeholder="Description"
									className="h-9 min-w-0 flex-1"
								/>
								<Input
									value={newCodeMult}
									onChange={(e) => setNewCodeMult(e.target.value)}
									placeholder="1.0"
									type="number"
									step="0.5"
									className="h-9 w-20 text-center"
								/>
								<Button size="sm" onClick={handleAddPayCode}>
									Add
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setShowAddPayCode(false)}
								>
									Cancel
								</Button>
							</div>
						)}
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>Client Cost Centers</Label>
						</div>
						<div className="flex flex-wrap gap-2">
							{costCenters.map((code) => (
								<Badge
									key={code}
									variant="secondary"
									className="gap-1 py-1 px-2"
								>
									{code}
									<X
										className="size-3 cursor-pointer"
										onClick={() =>
											onCostCentersChange(costCenters.filter((c) => c !== code))
										}
									/>
								</Badge>
							))}
							<div className="flex items-center gap-2">
								<Input
									value={newCostCenter}
									onChange={(e) => setNewCostCenter(e.target.value)}
									placeholder="Add center…"
									className="h-7 w-28 text-xs"
									onKeyDown={(e) => {
										if (e.key === "Enter" && newCostCenter.trim()) {
											onCostCentersChange([
												...costCenters,
												newCostCenter.trim().toUpperCase(),
											]);
											setNewCostCenter("");
										}
									}}
								/>
								<Button
									variant="secondary"
									size="sm"
									className="h-7 px-2 text-xs"
									onClick={() => {
										if (newCostCenter.trim()) {
											onCostCentersChange([
												...costCenters,
												newCostCenter.trim().toUpperCase(),
											]);
											setNewCostCenter("");
										}
									}}
								>
									<Plus className="size-3" />
								</Button>
							</div>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>Holidays Table</Label>
							{canAddHoliday && (
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setShowAddHoliday((v) => !v)}
								>
									<Plus className="size-4" />
									Add Holiday
								</Button>
							)}
						</div>

						<div className="space-y-2">
							{isLoading ? (
								<>
									<Skeleton className="h-9 w-full" />
									<Skeleton className="h-9 w-5/6" />
								</>
							) : (
								<>
									{holidays.map((item, i) => (
										<div
											key={item.id ?? `new-${i}`}
											className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
										>
											{canEditHoliday ? (
												<>
													<Input
														value={item.name}
														onChange={(e) =>
															patchHoliday(i, { name: e.target.value })
														}
														className="h-9 min-w-0 flex-1 text-sm"
														placeholder="Holiday name"
														aria-label="Holiday name"
													/>
													<DatePicker
														id={`holiday-observed-${item.id ?? i}`}
														value={toDateInputValue(item.observedOn)}
														onChange={(v) => patchHoliday(i, { observedOn: v })}
														className="h-9 w-60 shrink-0"
														placeholder="Observed date"
														clearable
													/>
													<Select
														value={item.holidayType ?? "Paid"}
														onValueChange={(v) =>
															patchHoliday(i, { holidayType: v })
														}
													>
														<SelectTrigger className="h-9 w-28 shrink-0">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Paid">Paid</SelectItem>
															<SelectItem value="Unpaid">Unpaid</SelectItem>
														</SelectContent>
													</Select>
												</>
											) : (
												<p className="text-sm">
													<span className="font-medium">{item.name}</span>
													{" — "}
													{toDateInputValue(item.observedOn) || "—"}
													{` (${item.holidayType ?? "Paid"})`}
												</p>
											)}
											{canDeleteHoliday && (
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
													onClick={() => handleDeleteHoliday(i)}
												>
													<Trash2 className="size-4" />
												</Button>
											)}
										</div>
									))}
									{holidays.length === 0 && !showAddHoliday && (
										<p className="text-sm text-muted-foreground">
											No holidays configured.
										</p>
									)}
								</>
							)}
						</div>

						{canAddHoliday && showAddHoliday && (
							<div className="flex flex-wrap items-center gap-2 rounded border border-dashed p-3 sm:flex-nowrap">
								<Input
									value={newHolidayName}
									onChange={(e) => setNewHolidayName(e.target.value)}
									placeholder="Holiday name"
									className="h-9 min-w-0 flex-1"
								/>
								<DatePicker
									value={newHolidayDate}
									onChange={setNewHolidayDate}
									className="h-9 w-40 shrink-0"
									placeholder="Pick date"
									clearable
								/>
								<Select
									value={newHolidayType}
									onValueChange={setNewHolidayType}
								>
									<SelectTrigger className="h-9 w-28">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Paid">Paid</SelectItem>
										<SelectItem value="Unpaid">Unpaid</SelectItem>
									</SelectContent>
								</Select>
								<Button size="sm" onClick={handleAddHoliday}>
									Add
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setShowAddHoliday(false)}
								>
									Cancel
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

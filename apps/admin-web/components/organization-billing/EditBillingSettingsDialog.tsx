"use client";

import {
	BILLING_CURRENCIES,
	BILLING_CYCLE_START_DAYS,
	BILLING_FREQUENCIES,
	INVOICE_GROUPING_METHODS,
	PAYMENT_TERMS,
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
import { FeeStructureForm } from "@repo/ui/general/billing/edit-settings/FeeStructureForm";
import { FinancialTablesSection } from "@repo/ui/general/billing/edit-settings/FinancialTablesSection";
import { GeneralBillingForm } from "@repo/ui/general/billing/edit-settings/GeneralBillingForm";
import { InvoicePreferencesForm } from "@repo/ui/general/billing/edit-settings/InvoicePreferencesForm";
import { TimekeepingRulesForm } from "@repo/ui/general/billing/edit-settings/TimekeepingRulesForm";
import type {
	BillingConfig,
	BillingFormState,
	HolidayFormItem,
	PayCodeFormItem,
} from "@repo/ui/general/billing/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useBillingAbilities } from "@/hooks/use-billing-abilities";
import {
	organizationBillingKeys,
	useBillingConfig,
	usePayCodes,
	useUpdateBillingConfig,
} from "@/queries/organization-billing.queries";
import {
	organizationTimekeepingKeys,
	useHolidays,
} from "@/queries/organization-timekeeping.queries";
import { OrganizationBillingService } from "@/services/organization-billing.service";
import { OrganizationTimekeepingService } from "@/services/organization-timekeeping.service";

/** Align with server `UpdateBillingConfigDto` `@IsIn` lists — empty or legacy DB values must not be sent as-is. */
function coerceBillingEnum<T extends readonly string[]>(
	value: string | null | undefined,
	allowed: T,
	fallback: T[number],
): T[number] {
	const v = typeof value === "string" ? value.trim() : "";
	if (!v) return fallback;
	return (allowed as readonly string[]).includes(v)
		? (v as T[number])
		: fallback;
}

const DEFAULT_STATE: BillingFormState = {
	clientBillingId: "",
	contactName: "",
	contactEmail: "",
	contactPhone: "",
	billingStreet: "",
	billingCity: "",
	billingState: "",
	billingZip: "",
	remittanceSameAsBilling: false,
	remittanceStreet: "",
	remittanceCity: "",
	remittanceState: "",
	remittanceZip: "",
	paymentTerms: "net_30",
	deliveryEmail: false,
	deliverySftp: false,
	deliveryDownload: false,
	invoiceGrouping: "By Requisition",
	currency: "USD",
	billingFrequency: "monthly",
	cycleStartDay: "Monday",
	otThreshold: 40,
	timesheetApproval: true,
	mobileEntry: false,
	fileUpload: false,
	disputeTracking: true,
	mspPercent: 0,
	saasPercent: 0,
	costCenters: [],
	payCodes: [],
	holidays: [],
};

function configToState(config: BillingConfig): BillingFormState {
	const billingStreet = config.billingStreet ?? "";
	const billingCity = config.billingCity ?? "";
	const billingState = config.billingState ?? "";
	const billingZip = config.billingZip ?? "";

	const remittanceStreet = config.remittanceStreet ?? "";
	const remittanceCity = config.remittanceCity ?? "";
	const remittanceState = config.remittanceState ?? "";
	const remittanceZip = config.remittanceZip ?? "";

	const remittanceSameAsBilling =
		!!remittanceStreet &&
		remittanceStreet === billingStreet &&
		remittanceCity === billingCity &&
		remittanceState === billingState &&
		remittanceZip === billingZip;

	return {
		clientBillingId: config.clientBillingId,
		contactName: config.contactName ?? "",
		contactEmail: config.contactEmail ?? "",
		contactPhone: config.contactPhone ?? "",
		billingStreet,
		billingCity,
		billingState,
		billingZip,
		remittanceSameAsBilling,
		remittanceStreet,
		remittanceCity,
		remittanceState,
		remittanceZip,
		paymentTerms: coerceBillingEnum(
			config.paymentTerms,
			PAYMENT_TERMS,
			"net_30",
		),
		deliveryEmail: config.invoiceDeliveryEmail,
		deliverySftp: config.invoiceDeliverySftp,
		deliveryDownload: config.invoiceDeliveryDownload,
		invoiceGrouping: coerceBillingEnum(
			config.invoiceGrouping,
			INVOICE_GROUPING_METHODS,
			"By Requisition",
		),
		currency: coerceBillingEnum(config.currency, BILLING_CURRENCIES, "USD"),
		billingFrequency: coerceBillingEnum(
			config.billingFrequency,
			BILLING_FREQUENCIES,
			"monthly",
		),
		cycleStartDay: coerceBillingEnum(
			config.cycleStartDay,
			BILLING_CYCLE_START_DAYS,
			"Monday",
		),
		otThreshold: config.otThreshold ?? 40,
		timesheetApproval: config.timesheetApproval ?? true,
		mobileEntry: config.mobileEntry ?? false,
		fileUpload: config.fileUpload ?? false,
		disputeTracking: config.disputeTracking ?? true,
		mspPercent: config.mspPercent ?? 0,
		saasPercent: config.saasPercent ?? 0,
		costCenters: [],
		payCodes: [],
		holidays: [],
	};
}

interface EditBillingSettingsDialogProps {
	organizationId: string;
	isOpen: boolean;
	onClose: () => void;
}

export function EditBillingSettingsDialog({
	organizationId,
	isOpen,
	onClose,
}: Readonly<EditBillingSettingsDialogProps>) {
	const orgId = organizationId;
	const queryClient = useQueryClient();

	const { data: config } = useBillingConfig(orgId);
	const { data: payCodesData, isLoading: payCodesLoading } = usePayCodes(
		orgId,
		{ limit: 100 },
	);
	const { data: holidaysData, isLoading: holidaysLoading } = useHolidays(
		orgId,
		{ year: new Date().getFullYear(), limit: 100 },
	);

	const {
		canUpdateConfigSection,
		canCreatePayCode,
		canUpdatePayCode,
		canDeletePayCode,
	} = useBillingAbilities();
	const updateMutation = useUpdateBillingConfig(orgId);
	const [isSaving, setIsSaving] = useState(false);

	const [formState, setFormState] = useState<BillingFormState>(DEFAULT_STATE);

	const originalPayCodeIds = useRef<Set<string>>(new Set());
	const originalHolidayIds = useRef<Set<string>>(new Set());
	const initialPayCodesRef = useRef<PayCodeFormItem[]>([]);
	const initialHolidaysRef = useRef<HolidayFormItem[]>([]);
	const hasInitializedForOpenRef = useRef(false);

	const payCodeChanged = (a: PayCodeFormItem, b: PayCodeFormItem): boolean =>
		a.code !== b.code ||
		a.description !== b.description ||
		a.category !== b.category ||
		(a.multiplier ?? null) !== (b.multiplier ?? null);

	const holidayChanged = (a: HolidayFormItem, b: HolidayFormItem): boolean => {
		const da = a.observedOn.slice(0, 10);
		const db = b.observedOn.slice(0, 10);
		return (
			a.name !== b.name ||
			da !== db ||
			(a.holidayType ?? "Paid") !== (b.holidayType ?? "Paid")
		);
	};

	useEffect(() => {
		if (!isOpen) {
			hasInitializedForOpenRef.current = false;
			return;
		}
		if (hasInitializedForOpenRef.current) return;
		if (payCodesLoading || holidaysLoading) return;
		if (!config) return;

		const base = configToState(config);

		const loadedPayCodes: PayCodeFormItem[] = (payCodesData?.data ?? []).map(
			(pc) => ({
				id: pc.id,
				code: pc.code,
				description: pc.description,
				category: pc.category,
				multiplier: pc.multiplier,
			}),
		);
		const loadedHolidays: HolidayFormItem[] = (holidaysData?.data ?? []).map(
			(h) => ({
				id: h.id,
				name: h.name,
				observedOn: h.observedOn,
				holidayType: h.holidayType || "Paid",
			}),
		);

		originalPayCodeIds.current = new Set(
			loadedPayCodes.map((pc) => pc.id ?? ""),
		);
		originalHolidayIds.current = new Set(loadedHolidays.map((h) => h.id ?? ""));
		initialPayCodesRef.current = structuredClone(loadedPayCodes);
		initialHolidaysRef.current = structuredClone(loadedHolidays);

		setFormState({
			...base,
			payCodes: loadedPayCodes,
			holidays: loadedHolidays,
		});
		hasInitializedForOpenRef.current = true;
	}, [
		isOpen,
		config,
		payCodesData,
		holidaysData,
		payCodesLoading,
		holidaysLoading,
	]);

	const patch = (p: Partial<BillingFormState>) =>
		setFormState((s) => ({ ...s, ...p }));

	const handleSave = async () => {
		if (
			!formState.deliveryEmail &&
			!formState.deliverySftp &&
			!formState.deliveryDownload
		) {
			toast.error("At least one invoice delivery method must be enabled");
			return;
		}

		const remittanceStreet = formState.remittanceSameAsBilling
			? formState.billingStreet
			: formState.remittanceStreet;
		const remittanceCity = formState.remittanceSameAsBilling
			? formState.billingCity
			: formState.remittanceCity;
		const remittanceState = formState.remittanceSameAsBilling
			? formState.billingState
			: formState.remittanceState;
		const remittanceZip = formState.remittanceSameAsBilling
			? formState.billingZip
			: formState.remittanceZip;

		const otThreshold = Number.isFinite(formState.otThreshold)
			? formState.otThreshold
			: 40;
		const mspPercent = Number.isFinite(formState.mspPercent)
			? formState.mspPercent
			: 0;
		const saasPercent = Number.isFinite(formState.saasPercent)
			? formState.saasPercent
			: 0;

		setIsSaving(true);
		try {
			await updateMutation.mutateAsync({
				contactName: formState.contactName,
				contactEmail: formState.contactEmail,
				contactPhone: formState.contactPhone,
				billingStreet: formState.billingStreet,
				billingCity: formState.billingCity,
				billingState: formState.billingState,
				billingZip: formState.billingZip,
				remittanceStreet,
				remittanceCity,
				remittanceState,
				remittanceZip,
				paymentTerms: coerceBillingEnum(
					formState.paymentTerms,
					PAYMENT_TERMS,
					"net_30",
				),
				billingFrequency: coerceBillingEnum(
					formState.billingFrequency,
					BILLING_FREQUENCIES,
					"monthly",
				),
				invoiceGrouping: coerceBillingEnum(
					formState.invoiceGrouping,
					INVOICE_GROUPING_METHODS,
					"By Requisition",
				),
				currency: coerceBillingEnum(
					formState.currency,
					BILLING_CURRENCIES,
					"USD",
				),
				cycleStartDay: coerceBillingEnum(
					formState.cycleStartDay,
					BILLING_CYCLE_START_DAYS,
					"Monday",
				),
				invoiceDeliveryEmail: formState.deliveryEmail,
				invoiceDeliverySftp: formState.deliverySftp,
				invoiceDeliveryDownload: formState.deliveryDownload,
				otThreshold,
				timesheetApproval: formState.timesheetApproval,
				mobileEntry: formState.mobileEntry,
				fileUpload: formState.fileUpload,
				disputeTracking: formState.disputeTracking,
				mspPercent,
				saasPercent,
			});

			const currentPayCodeIds = new Set(
				formState.payCodes.filter((pc) => pc.id).map((pc) => pc.id ?? ""),
			);
			const payCodeIdsToDelete = [...originalPayCodeIds.current].filter(
				(id) => !currentPayCodeIds.has(id),
			);
			const payCodesToCreate = formState.payCodes.filter((pc) => !pc.id);

			const currentHolidayIds = new Set(
				formState.holidays.filter((h) => h.id).map((h) => h.id ?? ""),
			);
			const holidayIdsToDelete = [...originalHolidayIds.current].filter(
				(id) => !currentHolidayIds.has(id),
			);
			const holidaysToCreate = formState.holidays.filter((h) => !h.id);

			const payCodeUpdates: Promise<unknown>[] = [];
			if (canUpdatePayCode) {
				for (const pc of formState.payCodes) {
					if (!pc.id) continue;
					const orig = initialPayCodesRef.current.find((o) => o.id === pc.id);
					if (!orig || !payCodeChanged(orig, pc)) continue;
					payCodeUpdates.push(
						OrganizationBillingService.updatePayCode(orgId, pc.id, {
							code: pc.code,
							category: pc.category,
							description: pc.description,
							multiplier:
								pc.multiplier === null || pc.multiplier === undefined
									? null
									: pc.multiplier,
						}),
					);
				}
			}

			const holidayUpdates: Promise<unknown>[] = [];
			for (const h of formState.holidays) {
				if (!h.id) continue;
				const orig = initialHolidaysRef.current.find((o) => o.id === h.id);
				if (!orig || !holidayChanged(orig, h)) continue;
				holidayUpdates.push(
					OrganizationTimekeepingService.updateHoliday(orgId, h.id, {
						name: h.name,
						observedOn: h.observedOn,
						holidayType: h.holidayType,
					}),
				);
			}

			await Promise.all([
				...(canDeletePayCode
					? payCodeIdsToDelete.map((id) =>
							OrganizationBillingService.deletePayCode(orgId, id),
						)
					: []),
				...holidayIdsToDelete.map((id) =>
					OrganizationTimekeepingService.deleteHoliday(orgId, id),
				),
			]);
			await Promise.all([...payCodeUpdates, ...holidayUpdates]);
			await Promise.all([
				...(canCreatePayCode
					? payCodesToCreate.map((pc) =>
							OrganizationBillingService.createPayCode(orgId, {
								code: pc.code,
								description: pc.description,
								category: pc.category,
								multiplier: pc.multiplier ?? undefined,
							}),
						)
					: []),
				...holidaysToCreate.map((h) =>
					OrganizationTimekeepingService.createHoliday(orgId, {
						name: h.name,
						observedOn: h.observedOn,
						holidayType: h.holidayType,
					}),
				),
			]);

			queryClient.invalidateQueries({
				queryKey: [...organizationBillingKeys.all, "pay-codes"],
			});
			queryClient.invalidateQueries({
				queryKey: organizationBillingKeys.payCodeStats(orgId),
			});
			queryClient.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "holidays"],
			});

			toast.success("Billing settings saved");
			onClose();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setIsSaving(false);
		}
	};

	const isTablesLoading = payCodesLoading || holidaysLoading;
	const isPending = isSaving || updateMutation.isPending;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="p-0 flex flex-col gap-0 max-h-[90vh] overflow-hidden">
				<DialogHeader className="p-6 border-b">
					<DialogTitle>Edit Billing Settings</DialogTitle>
					<DialogDescription>
						Modify the billing configuration, preferences, and financial rules.
					</DialogDescription>
				</DialogHeader>

				<div className="p-6 space-y-8 overflow-y-auto">
					{canUpdateConfigSection("general") && (
						<GeneralBillingForm state={formState} onChange={patch} />
					)}
					{canUpdateConfigSection("invoice-preferences") && (
						<InvoicePreferencesForm state={formState} onChange={patch} />
					)}
					{canUpdateConfigSection("timekeeping") && (
						<TimekeepingRulesForm state={formState} onChange={patch} />
					)}
					{canUpdateConfigSection("fee-structure") && (
						<FeeStructureForm state={formState} onChange={patch} />
					)}
					{canUpdateConfigSection("financial-tables") && (
						<FinancialTablesSection
							payCodes={formState.payCodes}
							onPayCodesChange={(v) => patch({ payCodes: v })}
							holidays={formState.holidays}
							onHolidaysChange={(v) => patch({ holidays: v })}
							costCenters={formState.costCenters}
							onCostCentersChange={(v) => patch({ costCenters: v })}
							isLoading={isTablesLoading}
							canAddPayCode={canCreatePayCode}
							canEditPayCode={canUpdatePayCode}
							canDeletePayCode={canDeletePayCode}
						/>
					)}
				</div>

				<DialogFooter className="p-6 border-t bg-muted/5">
					<div className="flex items-center gap-3 ml-auto">
						<Button variant="ghost" onClick={onClose} disabled={isPending}>
							Discard Changes
						</Button>
						<Button onClick={handleSave} disabled={isPending}>
							{isPending ? "Saving…" : "Save Configuration"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	EXTERNAL_WORKFORCE_TYPES,
	getLabel,
	INTERNAL_WORKFORCE_TYPES,
	type WorkforceBillingFeeType,
} from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { TintedMetricCard } from "@repo/ui/general/TintedMetricCard";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
	useBillingConfig,
	useUpdateBillingConfig,
	useUpdateWorkforceBillingRate,
	useWorkforceBillingRates,
} from "@/queries/organization-billing.queries";
import type { WorkforceBillingRateDto } from "@/services/organization-billing.service";
import { UpdateRatesDialog } from "./UpdateRatesDialog";
import {
	useWorkforceBillingRateColumns,
	type WorkforceBillingRateRow,
} from "./useWorkforceBillingRateColumns";

const WORKFORCE_OPTIONS = CANDIDATE_WORKFORCE_TYPE_OPTIONS as readonly {
	value: string;
	label: string;
}[];

const INTERNAL_SET = new Set<string>(
	INTERNAL_WORKFORCE_TYPES as readonly string[],
);
const EXTERNAL_SET = new Set<string>(
	EXTERNAL_WORKFORCE_TYPES as readonly string[],
);

function toRow(d: WorkforceBillingRateDto): WorkforceBillingRateRow {
	return {
		id: d.id,
		workforceType: d.workforceType,
		name: getLabel(WORKFORCE_OPTIONS, d.workforceType),
		status: d.isActive,
		techFee: d.techFee,
		feeType: d.feeType as WorkforceBillingFeeType,
	};
}

function pctDisplay(v: number | null | undefined, isLoading: boolean): string {
	if (isLoading) return "…";
	if (v == null || Number.isNaN(Number(v))) return "—";
	return `${Number(v).toFixed(2)}%`;
}

interface RatesTabContentProps {
	organizationId: string;
}

export default function RatesTabContent({
	organizationId,
}: RatesTabContentProps) {
	const { data: config, isLoading } = useBillingConfig(organizationId);
	const updateConfig = useUpdateBillingConfig(organizationId);
	const { data: rateDtos, isLoading: ratesLoading } =
		useWorkforceBillingRates(organizationId);
	const updateRate = useUpdateWorkforceBillingRate(organizationId);

	const rows = useMemo(() => (rateDtos ?? []).map(toRow), [rateDtos]);

	const internalRows = useMemo(
		() => rows.filter((r) => INTERNAL_SET.has(r.workforceType)),
		[rows],
	);
	const externalRows = useMemo(
		() => rows.filter((r) => EXTERNAL_SET.has(r.workforceType)),
		[rows],
	);

	const patchRate = useCallback(
		(
			rateId: string,
			payload: {
				isActive?: boolean;
				techFee?: number;
				feeType?: "HOUR" | "SHIFT";
			},
		) => {
			updateRate.mutate(
				{ rateId, payload },
				{
					onError: (err) =>
						toast.error(
							err instanceof Error
								? err.message
								: "Failed to update workforce rate",
						),
				},
			);
		},
		[updateRate],
	);

	const { columns } = useWorkforceBillingRateColumns({
		disabled: updateRate.isPending || ratesLoading,
		onStatusChange: (rateId, status) => patchRate(rateId, { isActive: status }),
		onRateChange: (rateId, techFee) =>
			patchRate(rateId, { techFee: Number.isFinite(techFee) ? techFee : 0 }),
		onFeeTypeChange: (rateId, feeType) => patchRate(rateId, { feeType }),
	});

	const handleSavePlatformRates = async (newMsp: number, newSaas: number) => {
		try {
			await updateConfig.mutateAsync({
				mspPercent: newMsp,
				saasPercent: newSaas,
			});
			toast.success("Platform rates updated.");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to update rates",
			);
			throw err;
		}
	};

	const mspValue = pctDisplay(config?.mspPercent, isLoading);
	const saasValue = pctDisplay(config?.saasPercent, isLoading);

	const markupNote =
		config?.markupType != null || config?.markupValue != null
			? `Billing markup: ${config.markupType ?? "—"}${config.markupValue != null ? ` (${config.markupValue})` : ""}`
			: null;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Rates Configuration"
				description="Manage platform rates and workforce-type technology fees for this organization"
				total={0}
				itemLabel=""
				itemLabelPlural=""
			/>

			<Card>
				<CardHeader>
					<CardTitle>Platform Rates</CardTitle>
					<CardDescription>
						Configure MSP and SaaS platform fee rates for this organization
						{markupNote ? (
							<span className="text-muted-foreground mt-2 block text-sm">
								{markupNote}
							</span>
						) : null}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<TintedMetricCard
							tone="sky"
							title="MSP Rate"
							value={mspValue}
							footer={
								<p className="text-muted-foreground mt-2 leading-snug">
									Managed Service Provider fee applied to all placements
								</p>
							}
						/>
						<TintedMetricCard
							tone="emerald"
							title="SaaS Rate"
							value={saasValue}
							footer={
								<p className="text-muted-foreground mt-2 leading-snug">
									Software subscription fee for platform usage
								</p>
							}
						/>
					</div>

					<UpdateRatesDialog
						mspRate={Number(config?.mspPercent ?? 0)}
						saasRate={Number(config?.saasPercent ?? 0)}
						isSaving={updateConfig.isPending}
						disabled={isLoading && !config}
						onSave={handleSavePlatformRates}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Internal Workforce Types</CardTitle>
					<CardDescription>
						Employees directly employed by organizations. Rates are stored per
						organization and workforce type (tech fee and per hour vs per
						shift).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable
						columns={columns}
						data={internalRows}
						className="rounded-none border-0"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>External Workforce Types</CardTitle>
					<CardDescription>
						Contract workers, vendors, and third-party staffing.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable
						columns={columns}
						data={externalRows}
						className="rounded-none border-0"
					/>
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { useStore } from "@tanstack/react-form";
import { addHours, format, parse } from "date-fns";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ShiftType } from "@/constants/shifts";
import { useShiftForm } from "@/hooks/use-shift-form";
import { useCreatePerDiemShift } from "@/queries/per-diem-shifts.queries";
import {
	useOrgOccupationSpecialties,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import type { CreateShiftFormValues } from "@/schemas";
import type { ShiftTemplateListItem } from "@/types/shift-template";
import { PerDiemShiftFormFields } from "./PerDiemShiftFormFields";
import { SelectedShiftTemplateCard } from "./SelectedShiftTemplateCard";
import { ShiftSummaryCard } from "./ShiftSummaryCard";
import { ShiftTemplateSelectorDialog } from "./ShiftTemplateSelectorDialog";

const INITIAL_FORM_VALUES: CreateShiftFormValues = {
	date: "",
	startTime: "",
	endTime: "",
	occupation: "",
	specialtyIds: [],
	shiftRatePerHour: 0,
	vendorRatePerHour: 0,
	shiftType: "",
	totalShiftHours: 0,
};

export function CreatePerDiemShiftPageContent() {
	const router = useRouter();
	const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<ShiftTemplateListItem | null>(null);
	const createShiftMutation = useCreatePerDiemShift();
	const orgOccupationsQuery = useShiftTemplateOccupations({});
	const selectedOrgOccupationId =
		orgOccupationsQuery.data?.find(
			(o) => o.id === selectedTemplate?.occupationId,
		)?.organizationOccupationId ?? null;
	const { data: specialtyRows, isLoading: specialtiesLoading } =
		useOrgOccupationSpecialties(selectedOrgOccupationId);
	const specialtyOptions = (specialtyRows ?? []).map((s) => ({
		id: s.specialtyId,
		name: s.name,
	}));
	const form = useShiftForm({
		defaultValues: INITIAL_FORM_VALUES,
		onSubmitInvalid: () => {
			toast.error("Please complete all required fields before creating shift.");
		},
		onSubmit: async ({ value }) => {
			if (!selectedTemplate) {
				toast.error("Please select a shift template.");
				return;
			}
			createShiftMutation.mutate(
				{
					shiftTemplateId: selectedTemplate.id,
					shiftDate: value.date,
					startTime: value.startTime,
					endTime: value.endTime,
					shiftType: value.shiftType as ShiftType,
					totalShiftHours: value.totalShiftHours,
					shiftRate: value.shiftRatePerHour,
					vendorRate: value.vendorRatePerHour,
					specialtyIds: value.specialtyIds,
					isUrgent: false,
				},
				{
					onSuccess: () => {
						toast.success("Shift created successfully.");
						router.push("/org/shifts");
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				},
			);
		},
	});

	const values = useStore(form.store, (state) => state.values);
	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

	const minStartTime = useMemo(() => {
		if (values.date !== today) return undefined;
		return format(new Date(), "HH:mm");
	}, [values.date, today]);

	useEffect(() => {
		if (values.startTime && values.totalShiftHours > 0) {
			try {
				const start = parse(values.startTime, "HH:mm", new Date());
				const end = addHours(start, values.totalShiftHours);
				const formattedEnd = format(end, "HH:mm");
				if (formattedEnd !== values.endTime) {
					form.setFieldValue("endTime", formattedEnd);
				}
			} catch {
				form.setFieldValue("endTime", "");
			}
		}
	}, [values.startTime, values.totalShiftHours, values.endTime, form]);
	const canCreate = Boolean(
		selectedTemplate &&
			values.date &&
			values.startTime &&
			values.endTime &&
			values.occupation &&
			values.shiftRatePerHour > 0 &&
			values.vendorRatePerHour >= 0 &&
			values.shiftType &&
			values.totalShiftHours > 0,
	);

	const onTemplateSelect = (template: ShiftTemplateListItem) => {
		setSelectedTemplate(template);
		form.setFieldValue("occupation", template.occupation.name);
		form.setFieldValue("specialtyIds", []);
		form.setFieldValue("shiftRatePerHour", template.baseRate);
		const vendorRate =
			template.vendorRateMarkupPercent != null
				? template.baseRate * (1 + template.vendorRateMarkupPercent / 100)
				: template.baseRate;
		form.setFieldValue(
			"vendorRatePerHour",
			Math.max(0, Number(vendorRate.toFixed(2))),
		);
		form.setFieldValue("shiftType", template.shiftType);
		form.setFieldValue("totalShiftHours", template.durationHours);
		setTemplateSelectorOpen(false);
	};

	const onCreateShift = () => {
		void form.handleSubmit();
	};

	return (
		<div className="space-y-5">
			<Link
				href="/org/shifts"
				className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back
			</Link>

			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Create Per Diem Shift
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Create a new per diem shift and notify eligible candidates
				</p>
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
				<div className="space-y-5 lg:col-span-2">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-xl">Shift Template</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							{selectedTemplate ? (
								<SelectedShiftTemplateCard
									template={selectedTemplate}
									onChangeTemplate={() => setTemplateSelectorOpen(true)}
								/>
							) : (
								<button
									type="button"
									onClick={() => setTemplateSelectorOpen(true)}
									className="text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm transition-colors hover:bg-muted/40"
								>
									<CalendarDays className="size-4" />
									Select a shift template to get started
								</button>
							)}
						</CardContent>
					</Card>

					{selectedTemplate && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-xl">Shift Details</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										void form.handleSubmit();
									}}
								>
									<PerDiemShiftFormFields
										form={form}
										values={values}
										submissionAttempts={submissionAttempts}
										minDate={today}
										minStartTime={minStartTime}
										specialtyOptions={specialtyOptions}
										specialtyOptionsLoading={specialtiesLoading}
									/>
								</form>
							</CardContent>
						</Card>
					)}
				</div>

				<div>
					<ShiftSummaryCard
						template={selectedTemplate}
						canCreate={canCreate}
						onCreate={onCreateShift}
					/>
				</div>
			</div>

			<ShiftTemplateSelectorDialog
				open={templateSelectorOpen}
				onOpenChange={setTemplateSelectorOpen}
				onSelect={onTemplateSelect}
			/>
		</div>
	);
}

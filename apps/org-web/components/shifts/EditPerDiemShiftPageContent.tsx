"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ConfigPageErrorState } from "@repo/ui/general/ConfigPageEmptyState";
import { useStore } from "@tanstack/react-form";
import { addHours, format, parse } from "date-fns";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { ShiftType } from "@/constants/shifts";
import { useShiftForm } from "@/hooks/use-shift-form";
import {
	usePerDiemShiftDetail,
	useUpdatePerDiemShift,
} from "@/queries/per-diem-shifts.queries";
import {
	useOrgOccupationSpecialties,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import type { CreateShiftFormValues } from "@/schemas";
import type { ShiftTemplateListItem } from "@/types/shift-template";
import { PerDiemShiftFormFields } from "./PerDiemShiftFormFields";
import { SelectedShiftTemplateCard } from "./SelectedShiftTemplateCard";
import { ShiftSummaryCard } from "./ShiftSummaryCard";

interface EditPerDiemShiftPageContentProps {
	shiftId: string;
}

export function EditPerDiemShiftPageContent({
	shiftId,
}: Readonly<EditPerDiemShiftPageContentProps>) {
	const router = useRouter();
	const shiftQuery = usePerDiemShiftDetail(shiftId);
	const updateMutation = useUpdatePerDiemShift(shiftId);
	const shift = shiftQuery.data;

	const orgOccupationsQuery = useShiftTemplateOccupations({});
	const selectedOrgOccupationId =
		orgOccupationsQuery.data?.find((o) => o.id === shift?.occupation.id)
			?.organizationOccupationId ?? null;
	const { data: specialtyRows, isLoading: specialtiesLoading } =
		useOrgOccupationSpecialties(selectedOrgOccupationId);
	const specialtyOptions = (specialtyRows ?? []).map((s) => ({
		id: s.specialtyId,
		name: s.name,
	}));

	const initialValues: CreateShiftFormValues = useMemo(
		() => ({
			date: shift?.shiftDate ?? "",
			startTime: shift?.startTime ?? "",
			endTime: shift?.endTime ?? "",
			occupation: shift?.occupation.name ?? "",
			specialtyIds: shift?.specialtyIds ?? [],
			shiftRatePerHour: shift?.shiftRate ?? 0,
			vendorRatePerHour: shift?.vendorRate ?? 0,
			shiftType: shift?.shiftType ?? "",
			totalShiftHours: shift?.totalShiftHours ?? 0,
		}),
		[shift],
	);

	const form = useShiftForm({
		defaultValues: initialValues,
		onSubmitInvalid: () => {
			toast.error("Please complete all required fields before saving.");
		},
		onSubmit: async ({ value }) => {
			updateMutation.mutate(
				{
					shiftDate: value.date,
					startTime: value.startTime,
					endTime: value.endTime,
					shiftType: value.shiftType as ShiftType,
					totalShiftHours: value.totalShiftHours,
					shiftRate: value.shiftRatePerHour,
					vendorRate: value.vendorRatePerHour,
					specialtyIds: value.specialtyIds,
				},
				{
					onSuccess: () => {
						toast.success("Shift updated successfully.");
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

	useEffect(() => {
		if (shift) form.reset(initialValues);
	}, [shift, initialValues, form]);

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

	const canSave = Boolean(
		shift?.isEditable &&
			values.date &&
			values.startTime &&
			values.endTime &&
			values.occupation &&
			values.shiftRatePerHour > 0 &&
			values.vendorRatePerHour >= 0 &&
			values.shiftType &&
			values.totalShiftHours > 0,
	);

	const onSave = () => {
		void form.handleSubmit();
	};

	const summaryTemplate: ShiftTemplateListItem | null = shift?.shiftTemplate
		? ({
				id: shift.shiftTemplate.id,
				templateName: shift.shiftTemplate.templateName,
				baseRate: shift.shiftTemplate.baseRate,
				baseBillRate: shift.shiftTemplate.baseBillRate,
				vendorRateMarkupPercent: shift.shiftTemplate.vendorRateMarkupPercent,
				durationHours: shift.shiftTemplate.durationHours,
				shiftType: shift.shiftTemplate.shiftType,
				occupation: shift.shiftTemplate.occupation,
				department: shift.shiftTemplate.department,
				location: shift.shiftTemplate.location,
			} as unknown as ShiftTemplateListItem)
		: null;

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
					Edit Per Diem Shift
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Update shift details. Template, occupation, department and location
					cannot be changed once a shift is created.
				</p>
			</div>

			{shiftQuery.isLoading ? (
				<div className="text-muted-foreground py-12 text-center text-sm">
					Loading shift…
				</div>
			) : shiftQuery.isError || !shift ? (
				<ConfigPageErrorState
					title="Could not load shift"
					description="The shift may have been deleted, or you may not have access to it."
				/>
			) : (
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
					<div className="space-y-5 lg:col-span-2">
						{!shift.isEditable && (
							<Card className="border-destructive/40 bg-destructive/5">
								<CardContent className="flex items-start gap-2 p-4 text-sm">
									<AlertCircle className="text-destructive size-4 mt-0.5 shrink-0" />
									<div>
										<p className="font-medium">
											This shift can no longer be edited.
										</p>
										<p className="text-muted-foreground mt-0.5">
											{shift.hasAssignments
												? "It has already been claimed by a candidate."
												: `Only OPEN shifts are editable (current status: ${shift.status}).`}
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{summaryTemplate && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-xl">Shift Template</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<SelectedShiftTemplateCard
										template={summaryTemplate}
										onChangeTemplate={() => {
											toast.info(
												"Template can't be changed after a shift is created.",
											);
										}}
									/>
								</CardContent>
							</Card>
						)}

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
									<fieldset
										disabled={!shift.isEditable || updateMutation.isPending}
										className="space-y-0 disabled:opacity-70"
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
									</fieldset>
								</form>
							</CardContent>
						</Card>
					</div>

					<div>
						<ShiftSummaryCard
							template={summaryTemplate}
							canCreate={canSave}
							onCreate={onSave}
							submitLabel="Save Changes"
							submitting={updateMutation.isPending}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

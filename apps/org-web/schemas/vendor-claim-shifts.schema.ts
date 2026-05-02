import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const timeRegex = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const overtimeEntrySchema = z.object({
	date: z.string().min(1, "Date is required"),
	startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	breakDuration: z.coerce.number().min(0, "Break duration must be positive"),
});

export const editTimecardSchema = z.object({
	actualStartTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	actualEndTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	breakDuration: z.coerce.number().min(0, "Break duration must be positive"),
	notes: z.string().optional(),
	overtimeEntries: z.array(overtimeEntrySchema),
});

export type EditTimecardFormValues = z.infer<typeof editTimecardSchema>;

// Infers the form type from the configuration for 1:1 type-safety.
const _dummyForm = () =>
	useForm({
		defaultValues: {} as EditTimecardFormValues,
		validators: {
			onSubmit: editTimecardSchema,
		},
	});
export type EditTimecardFormApi = ReturnType<typeof _dummyForm>;

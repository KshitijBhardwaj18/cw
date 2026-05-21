"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel } from "@repo/ui/components/field";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import {
	OCCUPATION_QUESTIONNAIRE_CERTIFICATION_OPTIONS,
	OCCUPATION_QUESTIONNAIRE_EHR_OPTIONS,
} from "@/constants/candidate-occupation-questionnaire.constants";
import { useOccupationQuestionnaireDialog } from "@/hooks/candidate/use-occupation-questionnaire-dialog";

export interface OccupationQuestionnaireDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	occupationTitle: string;
	initialEhrSystems: string[];
	initialCertifications: string[];
	onSave: (payload: { ehrSystems: string[]; certifications: string[] }) => void;
}

export function OccupationQuestionnaireDialog({
	open,
	onOpenChange,
	occupationTitle,
	initialEhrSystems,
	initialCertifications,
	onSave,
}: OccupationQuestionnaireDialogProps) {
	const { form, handleOpenChange } = useOccupationQuestionnaireDialog({
		open,
		onOpenChange,
		initialEhrSystems,
		initialCertifications,
		onSave,
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="sm:max-w-lg gap-0 overflow-hidden p-0"
				showCloseButton
			>
				<DialogHeader className="border-border border-b px-5 py-4">
					<DialogTitle className="text-xl font-bold">
						{occupationTitle}
					</DialogTitle>
					<DialogDescription>
						Optional but encouraged — Improves job matching
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-5 px-5 pb-5"
				>
					<form.Field name="ehrSystems">
						{(field) => (
							<Field>
								<FieldLabel
									className="text-sm font-medium"
									htmlFor={field.name}
								>
									EHR Systems Used
								</FieldLabel>
								<MultiSelect
									values={field.state.value}
									onValuesChange={field.handleChange}
								>
									<MultiSelectTrigger
										className="w-full justify-between"
										id={field.name}
									>
										<MultiSelectValue placeholder="Select options..." />
									</MultiSelectTrigger>
									<MultiSelectContent search={{ placeholder: "Search…" }}>
										{OCCUPATION_QUESTIONNAIRE_EHR_OPTIONS.map((opt) => (
											<MultiSelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</MultiSelectItem>
										))}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<form.Field name="certifications">
						{(field) => (
							<Field>
								<FieldLabel
									className="text-sm font-medium"
									htmlFor={field.name}
								>
									Nursing Certifications
								</FieldLabel>
								<MultiSelect
									values={field.state.value}
									onValuesChange={field.handleChange}
								>
									<MultiSelectTrigger
										className="w-full justify-between"
										id={field.name}
									>
										<MultiSelectValue placeholder="Select options..." />
									</MultiSelectTrigger>
									<MultiSelectContent search={{ placeholder: "Search…" }}>
										{OCCUPATION_QUESTIONNAIRE_CERTIFICATION_OPTIONS.map(
											(opt) => (
												<MultiSelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</MultiSelectItem>
											),
										)}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<FormDialogFooter
						form={form}
						cancelLabel="Skip for Now"
						onCancel={() => handleOpenChange(false)}
						submitLabel="Save & Continue"
						submitLoadingLabel="Saving…"
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

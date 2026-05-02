"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { useSelectRequisitionTypeDialog } from "@/hooks/use-select-requisition-type-dialog";
import type { RequisitionTemplateType } from "@/types/requisition-template";
import { RequisitionTypeSelectionCards } from "./RequisitionTypeSelectionCards";

interface SelectRequisitionTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelectType: (type: RequisitionTemplateType) => void;
}

export function SelectRequisitionTypeDialog({
	open,
	onOpenChange,
	onSelectType,
}: SelectRequisitionTypeDialogProps) {
	const { form, handleOpenChange } = useSelectRequisitionTypeDialog({
		open,
		onOpenChange,
		onSelectType,
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] min-w-[60vw] overflow-hidden p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle className="text-xl">
						Create Requisition Template – Select Type
					</DialogTitle>
					<DialogDescription>
						Choose the type of requisition template you want to create
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="flex flex-col"
				>
					<ScrollArea className="max-h-[calc(90vh-14rem)]">
						<form.Subscribe selector={(state) => state.values.selectedType}>
							{(selectedType) => (
								<RequisitionTypeSelectionCards
									selectedType={selectedType}
									onSelectType={(type: RequisitionTemplateType) =>
										form.setFieldValue("selectedType", type)
									}
									className="px-6 pb-6"
								/>
							)}
						</form.Subscribe>
					</ScrollArea>

					<div className="shrink-0 border-t px-6 pb-6 pt-4">
						<form.Subscribe selector={(state) => state.values.selectedType}>
							{(selectedType) => (
								<FormDialogFooter
									form={form}
									submitLabel="Continue"
									submitLoadingLabel="Continuing..."
									onCancel={() => handleOpenChange(false)}
									disabled={!selectedType}
								/>
							)}
						</form.Subscribe>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

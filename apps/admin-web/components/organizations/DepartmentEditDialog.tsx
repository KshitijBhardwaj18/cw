"use client";

import type { OrganizationDepartmentType } from "@repo/shared";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Loader2 } from "lucide-react";
import { useDepartmentEditDialog } from "@/hooks/use-department-edit-dialog";
import { DepartmentEditFormContent } from "./DepartmentEditFormContent";

type DepartmentEditDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	department: OrganizationDepartmentType | null;
};

export function DepartmentEditDialog({
	open,
	onOpenChange,
	organizationId,
	department,
}: Readonly<DepartmentEditDialogProps>) {
	const {
		department: departmentDetail,
		isLoadingDepartment,
		...dialogProps
	} = useDepartmentEditDialog({
		open,
		onOpenChange,
		organizationId,
		departmentId: department?.id ?? null,
	});

	if (!department) return null;

	return (
		<Dialog open={open} onOpenChange={dialogProps.handleOpenChange}>
			<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
				<DialogHeader className="shrink-0">
					<DialogTitle>Department Details</DialogTitle>
					<p className="text-muted-foreground text-sm">{department.name}</p>
				</DialogHeader>

				{isLoadingDepartment ? (
					<div className="flex flex-1 items-center justify-center py-12">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					departmentDetail && (
						<DepartmentEditFormContent
							key={departmentDetail.id}
							departmentDetail={departmentDetail}
							organizationId={organizationId}
							departmentId={departmentDetail.id}
							dialogProps={dialogProps}
						/>
					)
				)}
			</DialogContent>
		</Dialog>
	);
}

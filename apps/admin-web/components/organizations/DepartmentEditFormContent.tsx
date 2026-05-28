"use client";

import type { OrganizationDepartmentDetailType } from "@repo/shared";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { Info, Users } from "lucide-react";
import {
	type useDepartmentEditDialog,
	useDepartmentEditForm,
} from "@/hooks/use-department-edit-dialog";
import { DepartmentEditApproversTab } from "./DepartmentEditApproversTab";
import { DepartmentEditDetailsTab } from "./DepartmentEditDetailsTab";

type DepartmentEditFormContentProps = {
	departmentDetail: OrganizationDepartmentDetailType;
	organizationId: string;
	departmentId: string;
	dialogProps: Omit<
		ReturnType<typeof useDepartmentEditDialog>,
		"department" | "form" | "isLoadingDepartment"
	>;
};

export function DepartmentEditFormContent({
	departmentDetail,
	organizationId,
	departmentId,
	dialogProps,
}: Readonly<DepartmentEditFormContentProps>) {
	const { form, isPendingDetails } = useDepartmentEditForm({
		department: departmentDetail,
		organizationId,
		departmentId,
		onSuccess: () => dialogProps.handleOpenChange(false),
	});

	const {
		isPendingApprovers,
		handleOpenChange,
		handleSaveApprovers,
		locations,
		orgOccupations,
		orgMembers,
		onLocationsScrollToBottom,
		onOccupationsScrollToBottom,
	} = dialogProps;

	return (
		<Tabs defaultValue="details" className="w-full flex-col space-y-4">
			<TabsList className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2">
				<TabsTrigger value="details" className="gap-2">
					<Info className="size-4" />
					Department Details
				</TabsTrigger>
				<TabsTrigger value="approvers" className="gap-2">
					<Users className="size-4" />
					Timekeeping Approvers
				</TabsTrigger>
			</TabsList>

			<TabsContent value="details" className="space-y-6 pt-4">
				<DepartmentEditDetailsTab
					organizationId={organizationId}
					form={form}
					isPendingDetails={isPendingDetails}
					handleOpenChange={handleOpenChange}
					locations={locations}
					orgOccupations={orgOccupations}
					orgMembers={orgMembers}
					onLocationsScrollToBottom={onLocationsScrollToBottom}
					onOccupationsScrollToBottom={onOccupationsScrollToBottom}
				/>
			</TabsContent>

			<TabsContent value="approvers" className="space-y-4 pt-4">
				<DepartmentEditApproversTab
					organizationId={organizationId}
					departmentDetail={departmentDetail}
					handleSaveApprovers={handleSaveApprovers}
					isPendingApprovers={isPendingApprovers}
				/>
			</TabsContent>
		</Tabs>
	);
}

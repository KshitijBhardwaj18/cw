"use client";

import { SpecialtyStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
	ORGANIZATION_SPECIALTY_COLUMN_HEADERS,
	ORGANIZATION_SPECIALTY_COLUMN_KEYS,
} from "@/constants/tables/organization-specialties";
import type { OrganizationSpecialtyTableRowType } from "@/types/organization-specialty";

export interface UseOrganizationSpecialtyColumnsOptions {
	organizationId: string;
}

export const useOrganizationSpecialtyColumns = (
	options: UseOrganizationSpecialtyColumnsOptions,
) => {
	const { organizationId } = options;
	const router = useRouter();
	const columns = useMemo<ColumnDef<OrganizationSpecialtyTableRowType>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_SPECIALTY_COLUMN_KEYS.specialtyName,
				header: ORGANIZATION_SPECIALTY_COLUMN_HEADERS.specialtyName,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5 py-2">
						<div className="text-sm font-semibold">{row.original.acronym}</div>
						<div className="text-muted-foreground text-xs">
							{row.original.specialtyName}
						</div>
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_SPECIALTY_COLUMN_KEYS.acronym,
				header: ORGANIZATION_SPECIALTY_COLUMN_HEADERS.acronym,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.acronym}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_SPECIALTY_COLUMN_KEYS.linkedOccupation,
				header: ORGANIZATION_SPECIALTY_COLUMN_HEADERS.linkedOccupation,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.linkedOccupationName}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_SPECIALTY_COLUMN_KEYS.status,
				header: ORGANIZATION_SPECIALTY_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.status === SpecialtyStatus.ACTIVE
								? "success"
								: "inactive"
						}
					>
						{row.original.status === SpecialtyStatus.ACTIVE
							? "Active"
							: "Inactive"}
					</Badge>
				),
			},
			{
				id: ORGANIZATION_SPECIALTY_COLUMN_KEYS.actions,
				header: ORGANIZATION_SPECIALTY_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const isInactive = row.original.status === SpecialtyStatus.INACTIVE;
					return (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							disabled={isInactive}
							aria-label="View questionnaire"
							onClick={() =>
								router.push(
									`/organizations/${organizationId}/workforce/specialties/${row.original.id}/questionnaire`,
								)
							}
						>
							<FileText className="size-4" />
						</Button>
					);
				},
			},
		],
		[organizationId, router],
	);

	return { columns };
};

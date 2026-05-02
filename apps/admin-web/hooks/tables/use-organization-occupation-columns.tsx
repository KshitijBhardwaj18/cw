"use client";

import { OccupationStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
	ORGANIZATION_OCCUPATION_COLUMN_HEADERS,
	ORGANIZATION_OCCUPATION_COLUMN_KEYS,
} from "@/constants/tables/organization-occupations";
import type { OrganizationOccupationTableRowType } from "@/types/organization-occupation";

const MAX_VISIBLE_SPECIALTIES = 2;

function SpecialtiesCell({ acronyms }: { acronyms: string[] }) {
	if (acronyms.length === 0) {
		return (
			<span className="text-muted-foreground text-sm">No specialties</span>
		);
	}

	const visible = acronyms.slice(0, MAX_VISIBLE_SPECIALTIES);
	const remaining = acronyms.length - MAX_VISIBLE_SPECIALTIES;
	const hasMore = remaining > 0;

	const content = (
		<div className="flex flex-wrap items-center gap-1">
			{visible.map((a) => (
				<Badge key={a} variant="secondary">
					{a}
				</Badge>
			))}
			{hasMore && <Badge variant="secondary">+{remaining} more</Badge>}
		</div>
	);

	if (hasMore) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="cursor-default">{content}</div>
				</TooltipTrigger>
				<TooltipContent className="max-w-[min(16rem,90vw)]" sideOffset={4}>
					<div className="flex flex-wrap gap-1">
						{acronyms.map((a) => (
							<Badge key={a} variant="secondary" className="text-xs">
								{a}
							</Badge>
						))}
					</div>
				</TooltipContent>
			</Tooltip>
		);
	}

	return content;
}

interface UseOrganizationOccupationColumnsOptions {
	organizationId: string;
	onUnlink?: (row: OrganizationOccupationTableRowType) => void;
	onManageSpecialty?: (row: OrganizationOccupationTableRowType) => void;
}

export const useOrganizationOccupationColumns = (
	options: UseOrganizationOccupationColumnsOptions,
) => {
	const { organizationId, onUnlink, onManageSpecialty } = options;
	const router = useRouter();
	const columns = useMemo<ColumnDef<OrganizationOccupationTableRowType>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.name,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5 py-2">
						<div className="text-sm font-semibold">{row.original.name}</div>
						<div className="text-muted-foreground text-xs">
							{row.original.acronym}
						</div>
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.industry,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.industry,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.industry ?? "-"}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.acronym,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.acronym,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.acronym}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.code,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.code,
				cell: ({ row }) => (
					<div className="font-mono text-sm">{row.original.code}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.specialties,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.specialties,
				cell: ({ row }) => (
					<SpecialtiesCell acronyms={row.original.specialtyAcronyms} />
				),
			},
			{
				accessorKey: ORGANIZATION_OCCUPATION_COLUMN_KEYS.status,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.status === OccupationStatus.ACTIVE
								? "success"
								: "inactive"
						}
					>
						{row.original.status === OccupationStatus.ACTIVE
							? "Active"
							: "Inactive"}
					</Badge>
				),
			},
			{
				id: ORGANIZATION_OCCUPATION_COLUMN_KEYS.actions,
				header: ORGANIZATION_OCCUPATION_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const isInactive = row.original.status === OccupationStatus.INACTIVE;
					return (
						<div className="flex items-center gap-2">
							{!isInactive && (
								<>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => onManageSpecialty?.(row.original)}
									>
										<Settings className="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										aria-label="View questionnaire"
										onClick={() =>
											router.push(
												`/organizations/${organizationId}/workforce/occupations/${row.original.organizationOccupationId}/questionnaire`,
											)
										}
									>
										<FileText className="size-4" />
									</Button>
								</>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:text-destructive"
								onClick={() => onUnlink?.(row.original)}
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					);
				},
			},
		],
		[organizationId, onUnlink, onManageSpecialty, router],
	);

	return { columns };
};

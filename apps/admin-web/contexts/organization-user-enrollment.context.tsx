"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { createContext, type ReactNode, useContext } from "react";
import { useOrganizationUserEnrollmentPage } from "@/hooks/use-organization-user-enrollment-page";
import type {
	EnrolledOrganizationUserRow,
	EnrolledProgramUserRow,
	EnrolledVendorUserRow,
} from "@/types/users";

export type OrganizationUserEnrollmentContextValue = ReturnType<
	typeof useOrganizationUserEnrollmentPage
>;

const OrganizationUserEnrollmentContext =
	createContext<OrganizationUserEnrollmentContextValue | null>(null);

export function OrganizationUserEnrollmentProvider({
	organizationId,
	children,
}: {
	organizationId: string;
	children: ReactNode;
}) {
	const value = useOrganizationUserEnrollmentPage(organizationId);
	return (
		<OrganizationUserEnrollmentContext.Provider value={value}>
			{children}
		</OrganizationUserEnrollmentContext.Provider>
	);
}

export function useOrganizationUserEnrollment() {
	const ctx = useContext(OrganizationUserEnrollmentContext);
	if (!ctx) {
		throw new Error(
			"useOrganizationUserEnrollment must be used within OrganizationUserEnrollmentProvider",
		);
	}
	return ctx;
}

export type OrganizationUsersTabContentContextValue = {
	isLoading: boolean;
	isError: boolean;
	rows: EnrolledOrganizationUserRow[];
	columns: OrganizationUserEnrollmentContextValue["orgColumns"];
	debouncedSearch: string;
	totalCount: number | undefined;
	page: number;
	pageSize: number;
	onPaginationChange: (page: number, pageSize: number) => void;
	rowSelection: RowSelectionState;
	onRowSelectionChange: (
		updater:
			| RowSelectionState
			| ((old: RowSelectionState) => RowSelectionState),
	) => void;
	selectedCount: number;
	onClearSelection: () => void;
	onBulkSendInvite: () => void;
};

export function useOrganizationUsersTabContent(): OrganizationUsersTabContentContextValue {
	const ctx = useOrganizationUserEnrollment();
	return {
		isLoading: ctx.orgLoading,
		isError: ctx.orgError,
		rows: ctx.orgRows,
		columns: ctx.orgColumns,
		debouncedSearch: ctx.debouncedSearch,
		totalCount: ctx.orgResult?.total,
		page: ctx.orgPage,
		pageSize: ctx.orgPageSize,
		onPaginationChange: (page, pageSize) => {
			ctx.setOrgPage(page);
			ctx.setOrgPageSize(pageSize);
		},
		rowSelection: ctx.orgRowSelection,
		onRowSelectionChange: ctx.setOrgRowSelection,
		selectedCount: ctx.selectedOrgCount,
		onClearSelection: () => ctx.setOrgRowSelection({}),
		onBulkSendInvite: ctx.handleBulkSendInvite,
	};
}

export type ProgramUsersTabContentContextValue = {
	isLoading: boolean;
	isError: boolean;
	rows: EnrolledProgramUserRow[];
	columns: OrganizationUserEnrollmentContextValue["programColumns"];
	debouncedSearch: string;
	totalCount: number | undefined;
	page: number;
	pageSize: number;
	onPaginationChange: (page: number, pageSize: number) => void;
	rowSelection: RowSelectionState;
	onRowSelectionChange: (
		updater:
			| RowSelectionState
			| ((old: RowSelectionState) => RowSelectionState),
	) => void;
	selectedCount: number;
	onClearSelection: () => void;
	onBulkSendInvite: () => void;
};

export function useProgramUsersTabContent(): ProgramUsersTabContentContextValue {
	const ctx = useOrganizationUserEnrollment();
	return {
		isLoading: ctx.programLoading,
		isError: ctx.programError,
		rows: ctx.programRows,
		columns: ctx.programColumns,
		debouncedSearch: ctx.debouncedSearch,
		totalCount: ctx.programResult?.total,
		page: ctx.programPage,
		pageSize: ctx.programPageSize,
		onPaginationChange: (page, pageSize) => {
			ctx.setProgramPage(page);
			ctx.setProgramPageSize(pageSize);
		},
		rowSelection: ctx.programRowSelection,
		onRowSelectionChange: ctx.setProgramRowSelection,
		selectedCount: ctx.selectedProgramCount,
		onClearSelection: () => ctx.setProgramRowSelection({}),
		onBulkSendInvite: ctx.handleBulkSendInviteProgram,
	};
}

export type VendorUsersTabContentContextValue = {
	isLoading: boolean;
	isError: boolean;
	rows: EnrolledVendorUserRow[];
	columns: OrganizationUserEnrollmentContextValue["vendorColumns"];
	debouncedSearch: string;
	totalCount: number | undefined;
	page: number;
	pageSize: number;
	onPaginationChange: (page: number, pageSize: number) => void;
	rowSelection: RowSelectionState;
	onRowSelectionChange: (
		updater:
			| RowSelectionState
			| ((old: RowSelectionState) => RowSelectionState),
	) => void;
	selectedCount: number;
	onClearSelection: () => void;
	onBulkSendInvite: () => void;
};

export function useVendorUsersTabContent(): VendorUsersTabContentContextValue {
	const ctx = useOrganizationUserEnrollment();
	return {
		isLoading: ctx.vendorLoading,
		isError: ctx.vendorError,
		rows: ctx.vendorRows,
		columns: ctx.vendorColumns,
		debouncedSearch: ctx.debouncedSearch,
		totalCount: ctx.vendorResult?.total,
		page: ctx.vendorPage,
		pageSize: ctx.vendorPageSize,
		onPaginationChange: (page, pageSize) => {
			ctx.setVendorPage(page);
			ctx.setVendorPageSize(pageSize);
		},
		rowSelection: ctx.vendorRowSelection,
		onRowSelectionChange: ctx.setVendorRowSelection,
		selectedCount: ctx.selectedVendorCount,
		onClearSelection: () => ctx.setVendorRowSelection({}),
		onBulkSendInvite: ctx.handleBulkSendInviteVendor,
	};
}

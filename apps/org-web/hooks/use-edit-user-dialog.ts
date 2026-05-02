"use client";

import { MemberRole, ORG_PORTAL_MEMBER_ROLE_OPTIONS } from "@repo/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrgDepartmentsForUsers } from "@/queries/organizations.queries";
import type { UpdateOrgMemberPayload } from "@/services/organizations.service";
import type { User } from "@/types/user";
import { toggleOrgDepartmentSelection } from "@/utils/toggle-org-department-selection";

export type EditUserFormState = {
	firstName: string;
	lastName: string;
	email: string;
	title: string;
	role: MemberRole;
	departmentIds: string[];
};

const emptyForm = (): EditUserFormState => ({
	firstName: "",
	lastName: "",
	email: "",
	title: "",
	role: MemberRole.HIRING_MANAGER,
	departmentIds: [],
});

export function useEditUserDialog({
	open,
	user,
	orgId,
}: {
	open: boolean;
	user: User | null;
	orgId: string;
}) {
	const [formData, setFormData] = useState<EditUserFormState>(emptyForm);
	const { data: departmentOptions = [] } = useOrgDepartmentsForUsers(orgId);

	const allDeptIds = useMemo(
		() => departmentOptions.map((d) => d.id),
		[departmentOptions],
	);

	useEffect(() => {
		if (open && user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				title: user.title ?? "",
				role: user.role,
				departmentIds: [...user.departmentIds],
			});
		} else if (!open) {
			setFormData(emptyForm());
		}
	}, [open, user]);

	const setField = useCallback(
		<K extends keyof EditUserFormState>(
			key: K,
			value: EditUserFormState[K],
		) => {
			setFormData((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const toggleDepartment = useCallback(
		(deptId: string) => {
			setFormData((prev) => ({
				...prev,
				departmentIds: toggleOrgDepartmentSelection(
					prev.departmentIds,
					deptId,
					allDeptIds,
				),
			}));
		},
		[allDeptIds],
	);

	const isDeptChecked = useCallback(
		(deptId: string) =>
			formData.departmentIds.length === 0 ||
			formData.departmentIds.includes(deptId),
		[formData.departmentIds],
	);

	const buildPayload = useCallback((): UpdateOrgMemberPayload | null => {
		if (
			!formData.firstName.trim() ||
			!formData.lastName.trim() ||
			!formData.email.trim()
		) {
			return null;
		}
		return {
			firstName: formData.firstName.trim(),
			lastName: formData.lastName.trim(),
			email: formData.email.trim().toLowerCase(),
			title: formData.title.trim(),
			role: formData.role,
			departmentIds: formData.departmentIds,
		};
	}, [formData]);

	const canSubmit =
		!!formData.firstName.trim() &&
		!!formData.lastName.trim() &&
		!!formData.email.trim();

	return {
		formData,
		setField,
		departmentOptions,
		buildPayload,
		canSubmit,
		toggleDepartment,
		isDeptChecked,
		roleOptions: ORG_PORTAL_MEMBER_ROLE_OPTIONS,
	};
}

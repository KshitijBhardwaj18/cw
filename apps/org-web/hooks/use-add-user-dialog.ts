"use client";

import {
	getOrgPortalMemberRoleLabel,
	type MemberRole,
	ORG_PORTAL_MEMBER_ROLE_OPTIONS,
} from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import type { EnrollOrgUserPayload } from "@/services/organizations.service";

const emptyForm = {
	firstName: "",
	lastName: "",
	email: "",
	title: "",
	role: undefined as MemberRole | undefined,
};

export type AddUserFormState = typeof emptyForm;

export function useAddUserDialog(open: boolean) {
	const [formData, setFormData] = useState<AddUserFormState>(emptyForm);

	useEffect(() => {
		if (!open) {
			setFormData(emptyForm);
		}
	}, [open]);

	const setField = useCallback(
		<K extends keyof AddUserFormState>(key: K, value: AddUserFormState[K]) => {
			setFormData((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const buildPayload = useCallback((): EnrollOrgUserPayload | null => {
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.role
		) {
			return null;
		}
		const title =
			formData.title.trim() ||
			`${formData.firstName} ${formData.lastName}`.trim() ||
			getOrgPortalMemberRoleLabel(formData.role);

		return {
			firstName: formData.firstName.trim(),
			lastName: formData.lastName.trim(),
			email: formData.email.trim().toLowerCase(),
			title,
			role: formData.role,
		};
	}, [formData]);

	const canSubmit =
		!!formData.firstName &&
		!!formData.lastName &&
		!!formData.email &&
		!!formData.role;

	return {
		formData,
		setField,
		buildPayload,
		canSubmit,
		roleOptions: ORG_PORTAL_MEMBER_ROLE_OPTIONS,
	};
}

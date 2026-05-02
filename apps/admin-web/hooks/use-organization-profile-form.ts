"use client";

import {
	formatDate,
	type OrganizationResponseType,
	validateAgreementDocument,
	validateImageFile,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useUpdateOrganizationMutation } from "@/queries/organizations.query";
import type {
	CreateOrganizationPayload,
	UpdateOrganizationFormValues,
	UpdateOrganizationPayload,
} from "@/schemas/organization.schema";

function toFormValues(
	org: OrganizationResponseType,
): UpdateOrganizationFormValues {
	return {
		name: org.name,
		email: org.email,
		phone: org.phone,
		industry: org.industry,
		organizationType: org.organizationType,
		timeZone: org.timeZone,
		website: org.website ?? "",
		agreementRenewalDate: org.agreementRenewalDate
			? format(new Date(org.agreementRenewalDate), "yyyy-MM-dd")
			: "",
		description: org.description ?? "",
		isActive: org.isActive ?? true,
		expectedAnnualSpend: org.expectedAnnualSpend ?? null,
	};
}

function toApiPayload(
	values: UpdateOrganizationFormValues,
): UpdateOrganizationPayload {
	const payload: UpdateOrganizationPayload = {};
	if (values.name !== undefined) payload.name = values.name;
	if (values.email !== undefined) payload.email = values.email;
	if (values.phone !== undefined) payload.phone = values.phone;
	if (values.industry !== undefined)
		payload.industry = values.industry as CreateOrganizationPayload["industry"];
	if (values.organizationType !== undefined)
		payload.organizationType =
			values.organizationType as CreateOrganizationPayload["organizationType"];
	if (values.timeZone !== undefined)
		payload.timeZone = values.timeZone as CreateOrganizationPayload["timeZone"];
	if (values.website !== undefined)
		payload.website = values.website.trim() || undefined;
	if (values.agreementRenewalDate !== undefined)
		payload.agreementRenewalDate = values.agreementRenewalDate || undefined;
	if (values.description !== undefined)
		payload.description = values.description?.trim() || undefined;
	if (values.isActive !== undefined) payload.isActive = values.isActive;
	if (values.expectedAnnualSpend !== undefined)
		payload.expectedAnnualSpend = values.expectedAnnualSpend;

	return payload;
}

function hasChanges(
	initial: UpdateOrganizationFormValues,
	current: UpdateOrganizationFormValues,
): boolean {
	return (
		initial.name !== current.name ||
		initial.email !== current.email ||
		initial.phone !== current.phone ||
		initial.industry !== current.industry ||
		initial.organizationType !== current.organizationType ||
		initial.timeZone !== current.timeZone ||
		initial.website !== current.website ||
		initial.agreementRenewalDate !== current.agreementRenewalDate ||
		initial.description !== current.description ||
		initial.isActive !== current.isActive ||
		initial.expectedAnnualSpend !== current.expectedAnnualSpend
	);
}

export type UseOrganizationProfileFormProps = {
	organization: OrganizationResponseType;
};

export function useOrganizationProfileForm({
	organization,
}: UseOrganizationProfileFormProps) {
	const updateMutation = useUpdateOrganizationMutation();
	const logoInputRef = useRef<HTMLInputElement>(null);
	const agreementInputRef = useRef<HTMLInputElement>(null);

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [agreementFile, setAgreementFile] = useState<File | null>(null);
	const [agreementUploadDate, setAgreementUploadDate] = useState<string | null>(
		null,
	);

	const initialValues = useMemo(
		() => toFormValues(organization),
		[organization],
	);

	const form = useForm({
		defaultValues: initialValues,
		onSubmit: ({ value }) => {
			const payload = toApiPayload(value);
			const hasDataPayload = Object.keys(payload).length > 0;
			const hasFiles = !!logoFile || !!agreementFile;

			if (!hasDataPayload && !hasFiles) return;

			updateMutation.mutate(
				{
					id: organization.id,
					data: hasDataPayload ? payload : {},
					files: {
						...(logoFile && { logo: logoFile }),
						...(agreementFile && {
							serviceAgreement: agreementFile,
						}),
					},
				},
				{
					onSuccess: (updated) => {
						toast.success("Organization updated successfully");
						form.reset(toFormValues(updated));
						setLogoFile(null);
						setLogoPreview(null);
						setAgreementFile(null);
						setAgreementUploadDate(null);
						if (logoInputRef.current) logoInputRef.current.value = "";
						if (agreementInputRef.current) agreementInputRef.current.value = "";
					},
					onError: (err) =>
						toast.error(
							err instanceof Error
								? err.message
								: "Failed to update organization",
						),
				},
			);
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: only reset when viewing a different org by id
	useEffect(() => {
		form.reset(toFormValues(organization));
		setLogoFile(null);
		setLogoPreview(null);
		setAgreementFile(null);
		setAgreementUploadDate(null);
		if (logoInputRef.current) logoInputRef.current.value = "";
		if (agreementInputRef.current) agreementInputRef.current.value = "";
	}, [organization.id]);

	const handleLogoClick = useCallback(() => {
		logoInputRef.current?.click();
	}, []);

	const handleLogoChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const err = validateImageFile(file, "Logo");
			if (err) {
				toast.error(err);
				return;
			}
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = () => setLogoPreview(reader.result as string);
			reader.readAsDataURL(file);
			e.target.value = "";
		},
		[],
	);

	const handleAgreementClick = useCallback(() => {
		agreementInputRef.current?.click();
	}, []);

	const handleAgreementChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const err = validateAgreementDocument(file, "Service agreement");
			if (err) {
				toast.error(err);
				return;
			}
			setAgreementFile(file);
			setAgreementUploadDate(formatDate(new Date()));
			e.target.value = "";
		},
		[],
	);

	const handleAgreementReplace = useCallback(() => {
		setAgreementFile(null);
		setAgreementUploadDate(null);
		if (agreementInputRef.current) agreementInputRef.current.value = "";
		agreementInputRef.current?.click();
	}, []);

	const logoPreviewSrc = logoPreview ?? organization.logo ?? undefined;
	const hasFileChanges = !!logoFile || !!agreementFile;

	return {
		form,
		initialValues,
		hasChanges,
		logoInputRef,
		agreementInputRef,
		logoPreviewSrc,
		logoFile,
		agreementFile,
		agreementUploadDate,
		hasFileChanges,
		isPending: updateMutation.isPending,
		handleLogoClick,
		handleLogoChange,
		handleAgreementClick,
		handleAgreementChange,
		handleAgreementReplace,
	};
}

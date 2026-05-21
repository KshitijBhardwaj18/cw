"use client";

import {
	DEFAULT_TIMEZONE,
	formatDate,
	validateAgreementDocument,
	validateImageFile,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateOrganization } from "@/queries/organizations.query";
import {
	type AddOrganizationFormValues,
	addOrganizationSchema,
	type CreateOrganizationPayload,
} from "@/schemas/organization.schema";

const defaultLocation = {
	locationName: "",
	address: "",
	city: "",
	state: "",
	zipCode: "",
	locationType: "HEADQUARTERS",
	phone: "",
	email: "",
	costCenter: "",
};

const defaultFormValues: AddOrganizationFormValues = {
	organizationName: "",
	email: "",
	phone: "",
	industry: "",
	organizationType: "",
	timeZone: DEFAULT_TIMEZONE,
	website: "",
	agreementRenewalDate: "",
	description: "",
	locations: [defaultLocation],
};

export function useOrganizationCreatePage() {
	const logoInputRef = useRef<HTMLInputElement>(null);
	const agreementInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [agreementFile, setAgreementFile] = useState<File | null>(null);
	const [agreementUploadDate, setAgreementUploadDate] = useState<string | null>(
		null,
	);

	const createMutation = useCreateOrganization();

	const form = useForm({
		defaultValues: defaultFormValues,
		validators: { onSubmit: addOrganizationSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const data: CreateOrganizationPayload = {
				name: value.organizationName,
				email: value.email,
				phone: value.phone,
				industry: value.industry as CreateOrganizationPayload["industry"],
				organizationType:
					value.organizationType as CreateOrganizationPayload["organizationType"],
				timeZone: value.timeZone as CreateOrganizationPayload["timeZone"],
				website: value.website?.trim() || undefined,
				agreementRenewalDate: value.agreementRenewalDate || undefined,
				description: value.description?.trim() || undefined,
				locations: value.locations.map((loc) => ({
					name: loc.locationName,
					address: loc.address,
					city: loc.city,
					state: loc.state,
					zipCode: loc.zipCode,
					locationType:
						loc.locationType as CreateOrganizationPayload["locations"][0]["locationType"],
					phone: loc.phone?.trim() || undefined,
					email: loc.email?.trim() || undefined,
					costCenter: loc.costCenter?.trim() || undefined,
				})),
			};

			createMutation.mutate(
				{
					data,
					files: {
						...(logoFile && { logo: logoFile }),
						...(agreementFile && { serviceAgreement: agreementFile }),
					},
				},
				{
					onSuccess: () => {
						toast.success(
							`Organization ${value.organizationName} created successfully`,
						);
						handleClose();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				},
			);
		},
	});

	const handleClose = () => {
		router.push("/organizations");
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (createMutation.isPending) return;
		if (!nextOpen) handleClose();
	};

	const handleLogoClick = () => logoInputRef.current?.click();
	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
	};

	const handleAgreementClick = () => agreementInputRef.current?.click();
	const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
	};

	const handleAgreementReplace = () => {
		setAgreementFile(null);
		setAgreementUploadDate(null);
		if (agreementInputRef.current) agreementInputRef.current.value = "";
		agreementInputRef.current?.click();
	};

	return {
		form,
		logoInputRef,
		agreementInputRef,
		logoFile,
		logoPreview,
		agreementFile,
		agreementUploadDate,
		isPending: createMutation.isPending,
		handleOpenChange,
		handleLogoClick,
		handleLogoChange,
		handleAgreementClick,
		handleAgreementChange,
		handleAgreementReplace,
		defaultLocation,
	};
}

"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { validateImageFile } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useCreateOrganizationLocationMutation,
	useUpdateOrganizationLocationMutation,
} from "@/queries/organizations.query";
import type {
	CreateLocationPayload,
	LocationFormSchemaValues,
} from "@/schemas/organization.schema";
import { locationFormSchema } from "@/schemas/organization.schema";

const defaultFormValues: LocationFormSchemaValues = {
	name: "",
	address: "",
	city: "",
	state: "",
	zipCode: "",
	locationType: "HEADQUARTERS",
	phone: "",
	email: "",
	costCenter: "",
};

function locationToFormValues(
	loc: OrganizationLocationType,
): LocationFormSchemaValues {
	return {
		name: loc.name,
		address: loc.address,
		city: loc.city,
		state: loc.state,
		zipCode: loc.zipCode,
		locationType: loc.locationType,
		phone: loc.phone ?? "",
		email: loc.email ?? "",
		costCenter: loc.costCenter ?? "",
	};
}

export type UseLocationFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	initialLocation?: OrganizationLocationType | null;
};

export function useLocationFormDialog({
	open,
	onOpenChange,
	organizationId,
	initialLocation,
}: UseLocationFormDialogProps) {
	const createMutation = useCreateOrganizationLocationMutation();
	const updateMutation = useUpdateOrganizationLocationMutation();
	const isEdit = !!initialLocation;
	const photoInputRef = useRef<HTMLInputElement>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);

	const form = useForm({
		defaultValues: initialLocation
			? locationToFormValues(initialLocation)
			: defaultFormValues,
		validators: { onSubmit: locationFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const payload: CreateLocationPayload = {
				name: value.name,
				address: value.address,
				city: value.city,
				state: value.state,
				zipCode: value.zipCode,
				locationType:
					value.locationType as CreateLocationPayload["locationType"],
				phone: value.phone?.trim() || undefined,
				email: value.email?.trim() || undefined,
				costCenter: value.costCenter?.trim() || undefined,
			};

			if (isEdit && initialLocation) {
				updateMutation.mutate(
					{
						organizationId,
						locationId: initialLocation.id,
						payload,
						photo: photoFile ?? undefined,
					},
					{
						onSuccess: () => {
							toast.success("Location updated successfully");
							handleClose();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			} else {
				createMutation.mutate(
					{
						organizationId,
						payload,
						photo: photoFile ?? undefined,
					},
					{
						onSuccess: () => {
							toast.success("Location added successfully");
							handleClose();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			}
		},
	});

	const handleClose = () => {
		form.reset(defaultFormValues);
		setPhotoFile(null);
		setPhotoPreview(null);
		onOpenChange(false);
	};

	const handlePhotoClick = () => photoInputRef.current?.click();
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validateImageFile(file, "Location photo");
		if (err) {
			toast.error(err);
			return;
		}
		setPhotoFile(file);
		const reader = new FileReader();
		reader.onload = () => setPhotoPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	useEffect(() => {
		if (open && initialLocation) {
			form.reset(locationToFormValues(initialLocation));
			setPhotoPreview(initialLocation.photoUrl ?? null);
			setPhotoFile(null);
		} else if (open && !initialLocation) {
			form.reset(defaultFormValues);
			setPhotoPreview(null);
			setPhotoFile(null);
		}
	}, [open, initialLocation, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) handleClose();
		else onOpenChange(true);
	};

	return {
		form,
		isEdit,
		isPending,
		handleOpenChange,
		photoInputRef,
		photoFile,
		photoPreview,
		handlePhotoClick,
		handlePhotoChange,
	};
}

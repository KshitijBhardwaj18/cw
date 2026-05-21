"use client";

import {
	DEFAULT_TIMEZONE,
	formatDate,
	type MspResponseType,
	validateImageFile,
	validatePdfDocument,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useCreateMsp,
	useMsaSignedUrl,
	useUpdateMsp,
} from "@/queries/msps.query";
import {
	type AddMspFormValues,
	addMspSchema,
	addMspSchemaBase,
} from "@/schemas/msp.schema";

const defaultFormValues: AddMspFormValues = {
	mspName: "",
	logo: "",
	industry: "",
	organizationType: "",
	headquartersStreet: "",
	headquartersCity: "",
	headquartersState: "",
	headquartersZipCode: "",
	headquartersCountry: "",
	billingSameAsHeadquarters: true,
	billingStreet: "",
	billingCity: "",
	billingState: "",
	billingZipCode: "",
	billingCountry: "",
	phoneNumber: "",
	timeZone: DEFAULT_TIMEZONE,
	hasMsaDocument: false,
	msaFile: undefined,
	agreementRevisionDate: "",
};

function mspToFormValues(msp: MspResponseType): AddMspFormValues {
	const hq = msp.headquarters;
	const billing = msp.billing;
	return {
		mspName: msp.name,
		logo: msp.logo ?? "",
		industry: msp.industry,
		organizationType: msp.organizationType,
		headquartersStreet: hq?.street ?? "",
		headquartersCity: hq?.city ?? "",
		headquartersState: hq?.state ?? "",
		headquartersZipCode: hq?.zipCode ?? "",
		headquartersCountry: hq?.country ?? "",
		billingSameAsHeadquarters: msp.isBillingSame,
		billingStreet: billing?.street ?? "",
		billingCity: billing?.city ?? "",
		billingState: billing?.state ?? "",
		billingZipCode: billing?.zipCode ?? "",
		billingCountry: billing?.country ?? "",
		phoneNumber: msp.phoneNumber ?? "",
		timeZone: msp.timeZone,
		hasMsaDocument: msp.hasMsaDocument,
		msaFile: undefined,
		agreementRevisionDate: msp.msaAgreementRevisionDate
			? formatDate(msp.msaAgreementRevisionDate, "yyyy-MM-dd")
			: "",
	};
}

export type UseMspFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialMsp?: MspResponseType | null;
};

export function useMspForm({
	open,
	onOpenChange,
	initialMsp,
}: UseMspFormDialogProps) {
	const logoInputRef = useRef<HTMLInputElement>(null);
	const msaInputRef = useRef<HTMLInputElement>(null);

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [msaFile, setMsaFile] = useState<File | null>(null);
	const [msaUploadDate, setMsaUploadDate] = useState<string | null>(null);

	const createMutation = useCreateMsp();
	const updateMutation = useUpdateMsp();
	const msaSignedUrlMutation = useMsaSignedUrl();
	const isEdit = !!initialMsp;

	const form = useForm({
		defaultValues: initialMsp ? mspToFormValues(initialMsp) : defaultFormValues,
		validators: { onSubmit: addMspSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const data = {
				name: value.mspName,
				phoneNumber: value.phoneNumber,
				industry: value.industry,
				organizationType: value.organizationType,
				headquarters: {
					street: value.headquartersStreet,
					city: value.headquartersCity,
					state: value.headquartersState,
					zipCode: value.headquartersZipCode,
					country: value.headquartersCountry,
				},
				isBillingSame: value.billingSameAsHeadquarters,
				...(value.billingSameAsHeadquarters
					? {}
					: {
							billing: {
								street: value.billingStreet ?? "",
								city: value.billingCity ?? "",
								state: value.billingState ?? "",
								zipCode: value.billingZipCode ?? "",
								country: value.billingCountry ?? "",
							},
						}),
				timeZone: value.timeZone,
				...(value.logo ? { logo: value.logo } : {}),
				...(value.agreementRevisionDate
					? { msaAgreementRevisionDate: value.agreementRevisionDate }
					: {}),
			};

			const formData = new FormData();
			formData.append("data", JSON.stringify(data));
			if (logoFile) formData.append("logo", logoFile);
			if (msaFile) formData.append("msaDocument", msaFile);

			if (isEdit && initialMsp) {
				updateMutation.mutate(
					{ id: initialMsp.id, formData },
					{
						onSuccess: () => {
							toast.success(`MSP ${value.mspName} updated successfully`);
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
				createMutation.mutate(formData, {
					onSuccess: () => {
						toast.success(`MSP ${value.mspName} created successfully`);
						handleClose();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				});
			}
		},
	});

	const handleClose = () => {
		form.reset(defaultFormValues);
		setLogoFile(null);
		setLogoPreview(null);
		setMsaFile(null);
		setMsaUploadDate(null);
		onOpenChange(false);
	};

	useEffect(() => {
		if (open && initialMsp) {
			form.reset(mspToFormValues(initialMsp));
			setLogoFile(null);
			setLogoPreview(initialMsp.logo ?? null);
			setMsaFile(null);
			setMsaUploadDate(null);
		} else if (open && !initialMsp) {
			form.reset(defaultFormValues);
			setLogoFile(null);
			setLogoPreview(null);
			setMsaFile(null);
			setMsaUploadDate(null);
		}
	}, [open, initialMsp, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) handleClose();
		else onOpenChange(true);
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
		form.setFieldValue("logo", "");
		const reader = new FileReader();
		reader.onload = () => setLogoPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const handleMsaClick = () => msaInputRef.current?.click();
	const handleMsaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validatePdfDocument(file, "MSA document");
		if (err) {
			toast.error(err);
			return;
		}
		setMsaFile(file);
		form.setFieldValue("msaFile", file);
		setMsaUploadDate(formatDate(new Date()));
		if (!form.getFieldValue("agreementRevisionDate")) {
			form.setFieldValue(
				"agreementRevisionDate",
				formatDate(new Date(), "yyyy-MM-dd"),
			);
		}
		e.target.value = "";
	};

	const handleMsaDownload = () => {
		if (msaFile) {
			const url = URL.createObjectURL(msaFile);
			const a = document.createElement("a");
			a.href = url;
			a.download = msaFile.name;
			a.target = "_blank";
			a.click();
			URL.revokeObjectURL(url);
			return;
		}
		if (!initialMsp?.id) {
			toast.error("No MSA document to download");
			return;
		}
		msaSignedUrlMutation.mutate(initialMsp.id, {
			onSuccess: ({ signedUrl }) => {
				const a = document.createElement("a");
				a.href = signedUrl;
				a.download = "msa-document.pdf";
				a.target = "_blank";
				a.click();
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to get document",
				);
			},
		});
	};

	const handleMsaView = () => {
		if (msaFile) {
			window.open(URL.createObjectURL(msaFile), "_blank");
			return;
		}
		if (!initialMsp?.id) {
			toast.error("No MSA document to view");
			return;
		}
		msaSignedUrlMutation.mutate(initialMsp.id, {
			onSuccess: ({ signedUrl }) => {
				window.open(signedUrl, "_blank");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to get document",
				);
			},
		});
	};

	const handleMsaReplace = () => {
		setMsaFile(null);
		setMsaUploadDate(null);
		form.setFieldValue("msaFile", undefined);
		form.setFieldValue("hasMsaDocument", false);
		if (msaInputRef.current) msaInputRef.current.value = "";
	};

	return {
		form,
		logoInputRef,
		msaInputRef,
		logoFile,
		logoPreview,
		msaFile,
		msaUploadDate,
		isPending,
		isEdit,
		initialMsp,
		msaSignedUrlMutation,
		handleOpenChange,
		handleLogoClick,
		handleLogoChange,
		handleMsaClick,
		handleMsaChange,
		handleMsaDownload,
		handleMsaView,
		handleMsaReplace,
		addMspSchemaBase,
	};
}

export type MspFormInstance = ReturnType<typeof useMspForm>["form"];

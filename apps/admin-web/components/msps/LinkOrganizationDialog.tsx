"use client";

import { formatDate, type MspLinkedOrgWithOrganization } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Separator } from "@repo/ui/components/separator";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { cn } from "@repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import {
	Briefcase,
	Building2,
	Check,
	FileText,
	Loader2,
	MapPin,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMspAbilities } from "@/hooks/use-msp-abilities";
import { useUploadMspAddendum } from "@/queries/msp-linked-orgs.query";
import { useInfiniteOrganizationsQuery } from "@/queries/organizations.query";
import {
	type MspLinkOrgPayload,
	mspLinkOrgSchema,
	mspLinkOrgSchemaBase,
} from "@/schemas/msp-link-org.schema";

interface LinkOrganizationDialogProps {
	mspId: string;
	isOpen: boolean;
	onClose: () => void;
	onLink: (data: MspLinkOrgPayload) => void;
	isPending?: boolean;
	initialLink?: MspLinkedOrgWithOrganization;
	excludeOrganizationIds?: string[];
}

export function LinkOrganizationDialog({
	mspId,
	isOpen,
	onClose,
	onLink,
	isPending = false,
	initialLink,
	excludeOrganizationIds = [],
}: Readonly<LinkOrganizationDialogProps>) {
	const { canReadMspFeeFields } = useMspAbilities();
	const isEdit = !!initialLink;
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
		initialLink?.organizationId ?? null,
	);
	const [addendumFileName, setAddendumFileName] = useState<string>(
		initialLink?.addendumAgreementFileName ?? "",
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadAddendum = useUploadMspAddendum(mspId);

	const {
		data: orgsData,
		isLoading: isLoadingOrgs,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteOrganizationsQuery(10, undefined, searchTerm);

	const excludedSet = new Set(excludeOrganizationIds);
	const organizations = (
		orgsData?.pages.flatMap((page) => page.data) ?? []
	).filter((org) => !excludedSet.has(org.id));

	const observerRef = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoadingOrgs || isFetchingNextPage) return;
			if (observerRef.current) observerRef.current.disconnect();

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					void fetchNextPage();
				}
			});

			if (node) observerRef.current.observe(node);
		},
		[isLoadingOrgs, isFetchingNextPage, hasNextPage, fetchNextPage],
	);

	const form = useForm({
		defaultValues: {
			organizationId: initialLink?.organizationId ?? "",
			mspId,
			addendumFileKey: initialLink?.hasAddendumAgreement ? "__existing__" : "",
			addendumFileName: initialLink?.addendumAgreementFileName ?? "",
			addendumRevisionDate: initialLink?.addendumRevisionDate
				? formatDate(initialLink.addendumRevisionDate, "yyyy-MM-dd")
				: null,
			mspFeePercentage: initialLink?.mspFeePercentage ?? 0,
			saasFeePercentage: initialLink?.saasFeePercentage ?? 0,
			startDate: initialLink?.startDate
				? formatDate(initialLink.startDate, "yyyy-MM-dd")
				: formatDate(new Date(), "yyyy-MM-dd"),
			renewalDate: initialLink?.renewalDate
				? formatDate(initialLink.renewalDate, "yyyy-MM-dd")
				: formatDate(
						new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
						"yyyy-MM-dd",
					),
			possibleCancellationDate: initialLink?.possibleCancellationDate
				? formatDate(initialLink.possibleCancellationDate, "yyyy-MM-dd")
				: null,
		} as MspLinkOrgPayload,
		validators: {
			onSubmit: mspLinkOrgSchema,
		},
		onSubmit: async ({ value }) => {
			const orgId = selectedOrgId ?? initialLink?.organizationId;
			if (!orgId) {
				toast.error("Please select an organization");
				return;
			}
			if (!isEdit && value.addendumFileKey === "__existing__") {
				toast.error("Please upload an addendum agreement");
				return;
			}
			onLink({ ...value, organizationId: orgId, mspId });
		},
	});

	useEffect(() => {
		if (!isOpen) {
			setSearchTerm("");
		}
	}, [isOpen]);

	const handleAddendumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (!file) return;
		uploadAddendum.mutate(file, {
			onSuccess: (result) => {
				form.setFieldValue("addendumFileKey", result.key);
				form.setFieldValue("addendumFileName", result.fileName);
				setAddendumFileName(result.fileName);
				toast.success("Addendum uploaded");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to upload addendum",
				);
			},
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				className="hidden"
				onChange={handleAddendumChange}
			/>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Linked Organization" : "Link Organization"}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-6"
				>
					{!isEdit && (
						<div className="space-y-4">
							<FieldLabel>Search & Select Organization</FieldLabel>
							<div className="relative">
								<SearchBar
									placeholder="Search organizations by name, type, or location..."
									value={searchTerm}
									onChange={setSearchTerm}
									className="h-11"
								/>
								{isLoadingOrgs && (
									<Loader2 className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
								)}
							</div>

							<ScrollArea
								className={cn("border p-2", organizations.length > 3 && "h-64")}
							>
								{organizations.length > 0 ? (
									organizations.map((org, index) => (
										<div key={org.id}>
											<Button
												variant="ghost"
												type="button"
												className={cn(
													"flex-col items-start h-auto p-3 gap-1 border-2 w-full",
													selectedOrgId === org.id
														? "border-primary bg-primary/5 hover:bg-primary/5"
														: "border-transparent",
												)}
												onClick={() => {
													setSelectedOrgId(org.id);
													form.setFieldValue("organizationId", org.id);
												}}
											>
												<div className="flex items-center justify-between w-full">
													<span className="font-semibold text-sm">
														{org.name}
													</span>
													{selectedOrgId === org.id && (
														<div className="size-4 bg-primary rounded-full flex items-center justify-center">
															<Check className="size-3 text-white" />
														</div>
													)}
												</div>
												<div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
													{org.locations?.[0] && (
														<div className="flex items-center gap-1">
															<MapPin className="size-3" />
															{org.locations[0].city}, {org.locations[0].state}
														</div>
													)}
													<div className="flex items-center gap-1">
														<Building2 className="size-3" />
														Type: {org.organizationType.replace(/_/g, " ")}
													</div>
													<div className="flex items-center gap-1 text-primary font-medium">
														<Briefcase className="size-3" />
														{org._count?.organizationVendors ?? 0} Vendors
													</div>
												</div>
											</Button>
											{index !== organizations.length - 1 && (
												<Separator className="my-2" />
											)}
										</div>
									))
								) : (
									<div className="p-8 text-center text-sm text-muted-foreground">
										{searchTerm
											? "No organizations found"
											: "Type to search organizations"}
									</div>
								)}

								{hasNextPage && (
									<div ref={lastElementRef} className="h-10 w-full">
										{isFetchingNextPage && (
											<div className="flex items-center justify-center p-2">
												<Loader2 className="size-5 animate-spin text-muted-foreground" />
											</div>
										)}
									</div>
								)}
							</ScrollArea>
						</div>
					)}

					<FieldGroup>
						<form.Field
							name="addendumFileKey"
							validators={{
								onChange: mspLinkOrgSchemaBase.shape.addendumFileKey,
							}}
						>
							{(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Addendum Agreement</FieldLabel>
									<div className="flex flex-wrap items-center gap-3">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											disabled={uploadAddendum.isPending}
										>
											{uploadAddendum.isPending ? (
												<Loader2
													className="size-4 animate-spin"
													data-icon="inline-start"
												/>
											) : (
												<Upload className="size-4" data-icon="inline-start" />
											)}
											{addendumFileName || field.state.value
												? "Replace PDF"
												: "Upload PDF"}
										</Button>
										{(addendumFileName ||
											(isEdit && field.state.value === "__existing__")) && (
											<div className="flex items-center gap-2 text-sm">
												<FileText className="text-muted-foreground size-4 shrink-0" />
												<span className="font-medium">
													{addendumFileName ||
														initialLink?.addendumAgreementFileName ||
														"Existing document"}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="size-6"
													onClick={() => {
														setAddendumFileName("");
														form.setFieldValue("addendumFileKey", "");
														form.setFieldValue("addendumFileName", "");
													}}
												>
													<X className="size-3.5" />
												</Button>
											</div>
										)}
									</div>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</form.Field>

						{canReadMspFeeFields && (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field
									name="mspFeePercentage"
									validators={{
										onChange: mspLinkOrgSchemaBase.shape.mspFeePercentage,
									}}
								>
									{(field) => (
										<Field data-invalid={field.state.meta.errors.length > 0}>
											<FieldLabel>MSP Fee %</FieldLabel>
											<Input
												type="number"
												step="0.01"
												placeholder="5.00"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field
									name="saasFeePercentage"
									validators={{
										onChange: mspLinkOrgSchemaBase.shape.saasFeePercentage,
									}}
								>
									{(field) => (
										<Field data-invalid={field.state.meta.errors.length > 0}>
											<FieldLabel>SAAS Fee %</FieldLabel>
											<Input
												type="number"
												step="0.01"
												placeholder="2.00"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</div>
						)}

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="startDate"
								validators={{
									onChange: mspLinkOrgSchemaBase.shape.startDate,
								}}
							>
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel>Agreement Start Date</FieldLabel>
										<DatePicker
											value={field.state.value}
											onChange={(v) => field.handleChange(v)}
											placeholder="mm/dd/yyyy"
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field
								name="renewalDate"
								validators={{
									onChange: mspLinkOrgSchemaBase.shape.renewalDate,
								}}
							>
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel>Agreement Renewal Date</FieldLabel>
										<DatePicker
											value={field.state.value}
											onChange={(v) => field.handleChange(v)}
											placeholder="mm/dd/yyyy"
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>
						</div>

						<form.Field
							name="possibleCancellationDate"
							validators={{
								onChange: mspLinkOrgSchemaBase.shape.possibleCancellationDate,
							}}
						>
							{(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Possible Cancellation Date</FieldLabel>
									<DatePicker
										value={field.state.value ?? undefined}
										onChange={(v) => field.handleChange(v)}
										placeholder="mm/dd/yyyy"
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isPending ||
								uploadAddendum.isPending ||
								(!isEdit && !selectedOrgId)
							}
						>
							{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
							{isEdit ? "Save Changes" : "Link Organization"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

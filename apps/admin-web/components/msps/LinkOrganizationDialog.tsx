"use client";

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
import { Briefcase, Building2, Check, Loader2, MapPin } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useInfiniteOrganizationsQuery } from "@/queries/organizations.query";
import {
	type MspLinkOrgPayload,
	mspLinkOrgSchema,
} from "@/schemas/msp-link-org.schema";

interface LinkOrganizationDialogProps {
	mspId: string;
	isOpen: boolean;
	onClose: () => void;
	onLink: (data: MspLinkOrgPayload) => void;
	isPending?: boolean;
}

export function LinkOrganizationDialog({
	mspId,
	isOpen,
	onClose,
	onLink,
	isPending = false,
}: LinkOrganizationDialogProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

	const {
		data: orgsData,
		isLoading: isLoadingOrgs,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteOrganizationsQuery(10, undefined, searchTerm);

	const organizations = orgsData?.pages.flatMap((page) => page.data) ?? [];

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
			organizationId: "",
			mspId: mspId,
			addendumAgreement: "",
			mspFeePercentage: 0,
			saasFeePercentage: 0,
			startDate: new Date().toISOString().split("T")[0],
			renewalDate: new Date(
				new Date().setFullYear(new Date().getFullYear() + 1),
			)
				.toISOString()
				.split("T")[0],
			possibleCancellationDate: null as string | null,
		} as MspLinkOrgPayload,
		validators: {
			onSubmit: mspLinkOrgSchema,
		},
		onSubmit: async ({ value }) => {
			if (!selectedOrgId) {
				toast.error("Please select an organization");
				return;
			}
			// TODO: Add real mutation logic here
			onLink({ ...value, organizationId: selectedOrgId, mspId });
		},
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Link Organization</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-6"
				>
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
								<Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
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

					<FieldGroup>
						<form.Field
							name="addendumAgreement"
							validators={{
								onChange: mspLinkOrgSchema.shape.addendumAgreement,
							}}
						>
							{(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Addendum Agreement</FieldLabel>
									<Input
										placeholder="Document name"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</form.Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="mspFeePercentage"
								validators={{
									onChange: mspLinkOrgSchema.shape.mspFeePercentage,
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
									onChange: mspLinkOrgSchema.shape.saasFeePercentage,
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

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="startDate"
								validators={{
									onChange: mspLinkOrgSchema.shape.startDate,
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
									onChange: mspLinkOrgSchema.shape.renewalDate,
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
								onChange: mspLinkOrgSchema.shape.possibleCancellationDate,
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
						<Button type="submit" disabled={isPending || !selectedOrgId}>
							{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
							Link Organization
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

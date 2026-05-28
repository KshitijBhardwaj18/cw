"use client";

import type { OrgVendorUserType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
	useEnrollExistingUser,
	useInfiniteOrgVendorUsers,
} from "@/queries/organizations.query";

const enrollVendorUserSchema = z.object({
	userId: z.string().min(1, "Please select a vendor user"),
});

type EnrollVendorUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
};

function getUserDisplayInfo(user: OrgVendorUserType) {
	const name = user.name ?? user.email;
	const email = user.email;
	const title = user.title ?? null;
	const vendorName = user.vendorUser?.vendor?.name ?? null;
	const subtitle = [title, vendorName].filter(Boolean).join(" • ");
	return { name, email, subtitle };
}

export function EnrollVendorUserDialog({
	open,
	onOpenChange,
	organizationId,
}: Readonly<EnrollVendorUserDialogProps>) {
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("");
	const listRef = useRef<HTMLDivElement>(null);
	const fetchNextPageRef = useRef<() => void>(() => {});

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteOrgVendorUsers(
			organizationId,
			debouncedSearch.trim() || undefined,
		);

	fetchNextPageRef.current = fetchNextPage;
	const vendorUsers = data?.pages.flatMap((p) => p.data) ?? [];

	const handleListScroll = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const list = listRef.current;
		if (!list) return;
		const { scrollTop, scrollHeight, clientHeight } = list;
		if (scrollTop + clientHeight >= scrollHeight - 80) {
			fetchNextPageRef.current();
		}
	}, [hasNextPage, isFetchingNextPage]);

	useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const list = listRef.current;
		if (!list) return;
		const rafId = requestAnimationFrame(() => {
			const itemCount = vendorUsers.length;
			if (itemCount >= 0 && list.scrollHeight <= list.clientHeight) {
				fetchNextPageRef.current();
			}
		});
		return () => cancelAnimationFrame(rafId);
	}, [vendorUsers, hasNextPage, isFetchingNextPage]);

	const enrollMutation = useEnrollExistingUser(organizationId, "vendor");

	const form = useForm({
		defaultValues: { userId: "" },
		validators: { onSubmit: enrollVendorUserSchema },
		onSubmit: ({ value }) => {
			enrollMutation.mutate(
				{ userId: value.userId },
				{
					onSuccess: () => {
						toast.success("Vendor user enrolled successfully");
						onOpenChange(false);
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

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (open && !wasOpenRef.current) {
			form.reset({ userId: "" });
			setSearch("");
		}
		wasOpenRef.current = open;
	}, [open, form, setSearch]);

	const handleOpenChange = (next: boolean) => {
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Enroll Vendor User</DialogTitle>
					<DialogDescription>
						Select a vendor user to grant access to this organization.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<form.Field
						name="userId"
						validators={{ onChange: enrollVendorUserSchema.shape.userId }}
					>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="vendor-user-search">
										Select Vendor User <RequiredStar />
									</FieldLabel>
									<p className="text-muted-foreground text-xs">
										Search and select an existing vendor user to enroll
									</p>

									<div className="relative mt-1">
										<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
										<Input
											id="vendor-user-search"
											placeholder="Search by name, email, or vendor..."
											className="pl-9"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
										/>
									</div>

									<div
										ref={listRef}
										onScroll={handleListScroll}
										className="mt-1 max-h-36 overflow-y-auto rounded-md border"
									>
										{isLoading && (
											<div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
												<Loader2 className="mr-2 size-4 animate-spin" />
												Loading users...
											</div>
										)}
										{!isLoading && vendorUsers.length === 0 && (
											<p className="text-muted-foreground py-6 text-center text-sm">
												No vendor users found.
											</p>
										)}
										{vendorUsers.map((user) => {
											const info = getUserDisplayInfo(user);
											const isSelected = field.state.value === user.id;
											return (
												<button
													key={user.id}
													type="button"
													className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
													onClick={() => field.handleChange(user.id)}
												>
													<span
														className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}
													>
														{isSelected && (
															<span className="bg-primary size-2 rounded-full" />
														)}
													</span>
													<span className="min-w-0">
														<span className="block font-medium text-sm">
															{info.name}
														</span>
														<span className="text-muted-foreground block text-xs">
															{info.email}
														</span>
														{info.subtitle && (
															<span className="text-muted-foreground block text-xs">
																{info.subtitle}
															</span>
														)}
													</span>
												</button>
											);
										})}
										{isFetchingNextPage && (
											<div className="text-muted-foreground flex items-center justify-center py-2 text-xs">
												<Loader2 className="mr-1.5 size-3 animate-spin" />
												Loading more...
											</div>
										)}
									</div>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(s) => ({
								canSubmit: s.canSubmit,
								isSubmitting: s.isSubmitting,
							})}
						>
							{({ canSubmit, isSubmitting }) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Enrolling...
										</>
									) : (
										"Enroll Vendor User"
									)}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import type { OrgDepartmentOption } from "@repo/shared";
import { VendorUserRole } from "@repo/shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { vendorUserRoleLabel } from "@/constants/vendor-users";
import { useShiftTemplateDepartments } from "@/queries/shift-templates.queries";
import {
	type AddVendorUserFormValues,
	addVendorUserSchema,
} from "@/schemas/vendor-user.schema";
import type { VendorPortalUserRow } from "@/types/vendor-users";

const ROLE_SELECT_OPTIONS: { value: VendorUserRole; label: string }[] = [
	{
		value: VendorUserRole.VENDOR_MANAGER,
		label: vendorUserRoleLabel(VendorUserRole.VENDOR_MANAGER),
	},
	{
		value: VendorUserRole.VENDOR_USER,
		label: vendorUserRoleLabel(VendorUserRole.VENDOR_USER),
	},
	{
		value: VendorUserRole.VENDOR_VIEW_ONLY,
		label: vendorUserRoleLabel(VendorUserRole.VENDOR_VIEW_ONLY),
	},
];

const EMPTY_FORM_VALUES: AddVendorUserFormValues = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	role: VendorUserRole.VENDOR_USER,
	department: "",
};

function resolveDepartmentIdFromRow(
	row: VendorPortalUserRow,
	departments: OrgDepartmentOption[],
): string {
	if (row.department === "—" || row.department.trim() === "") return "";
	const byName = departments.find((d) => d.name === row.department);
	if (byName) return byName.id;
	const byLabel = departments.find(
		(d) => `${d.name} (${d.location.name})` === row.department,
	);
	return byLabel?.id ?? "";
}

function vendorUserRowToFormValues(
	row: VendorPortalUserRow,
	departments: OrgDepartmentOption[],
): AddVendorUserFormValues {
	const departmentId = resolveDepartmentIdFromRow(row, departments);
	return {
		firstName: row.firstName,
		lastName: row.lastName,
		email: row.email,
		phone: row.phone === "—" ? "" : row.phone,
		role: row.role,
		department: departmentId,
	};
}

type AddVendorUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingUser: VendorPortalUserRow | null;
	organizationId: string | null;
	onCreate: (values: AddVendorUserFormValues) => Promise<void>;
	onUpdate: (userId: string, values: AddVendorUserFormValues) => Promise<void>;
};

export function AddVendorUserDialog({
	open,
	onOpenChange,
	editingUser,
	organizationId,
	onCreate,
	onUpdate,
}: Readonly<AddVendorUserDialogProps>) {
	const isEditMode = editingUser !== null;
	const editingUserRef = useRef(editingUser);
	editingUserRef.current = editingUser;

	const { data: departmentsData, isPending: departmentsLoading } =
		useShiftTemplateDepartments({
			enabled: open && Boolean(organizationId),
		});
	const departments = useMemo(() => departmentsData ?? [], [departmentsData]);

	const form = useForm({
		defaultValues: EMPTY_FORM_VALUES,
		validators: { onSubmit: addVendorUserSchema },
		onSubmitInvalid: () => {
			toast.error("Please fix the highlighted fields.");
		},
		onSubmit: async ({ value }) => {
			const current = editingUserRef.current;
			try {
				if (current) {
					await onUpdate(current.id, value);
				} else {
					await onCreate(value);
				}
				form.reset(EMPTY_FORM_VALUES);
				onOpenChange(false);
			} catch {}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	useEffect(() => {
		if (!open) return;
		if (!editingUser) {
			form.reset(EMPTY_FORM_VALUES);
			return;
		}
		// Wait for department options unless org has no org context (cannot load anyway).
		if (organizationId && departments.length === 0 && departmentsLoading) {
			return;
		}
		form.reset(vendorUserRowToFormValues(editingUser, departments));
	}, [
		open,
		editingUser,
		organizationId,
		departments,
		departmentsLoading,
		form.reset,
	]);

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			form.reset(EMPTY_FORM_VALUES);
		}
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update this user's details."
							: "Invite a teammate to the vendor portal."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field
							name="firstName"
							validators={{ onBlur: addVendorUserSchema.shape.firstName }}
						>
							{(field) => (
								<Field
									data-invalid={formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									)}
								>
									<FieldLabel htmlFor={field.name}>
										First Name <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
										onBlur={field.handleBlur}
										placeholder="First name"
										autoComplete="given-name"
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</form.Field>

						<form.Field
							name="lastName"
							validators={{ onBlur: addVendorUserSchema.shape.lastName }}
						>
							{(field) => (
								<Field
									data-invalid={formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									)}
								>
									<FieldLabel htmlFor={field.name}>
										Last Name <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
										onBlur={field.handleBlur}
										placeholder="Last name"
										autoComplete="family-name"
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</form.Field>
					</div>

					<form.Field
						name="email"
						validators={{ onBlur: addVendorUserSchema.shape.email }}
					>
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>
									Email Address <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									type="email"
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="email@vendorcorp.com"
									autoComplete="email"
									readOnly={isEditMode}
									className={isEditMode ? "bg-muted" : undefined}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field
						name="phone"
						validators={{ onBlur: addVendorUserSchema.shape.phone }}
					>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Phone Number <RequiredStar />
									</FieldLabel>
									<PhoneInput
										id={field.name}
										name={field.name}
										autoComplete="tel"
										placeholder="+19876543210"
										className="w-full"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(value) => field.handleChange(value)}
										aria-invalid={isInvalid}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="role"
						validators={{ onBlur: addVendorUserSchema.shape.role }}
					>
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>
									Role <RequiredStar />
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(v) => {
										field.handleChange(v as VendorUserRole);
										field.handleBlur();
									}}
								>
									<SelectTrigger id={field.name} className="w-full">
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent>
										{ROLE_SELECT_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground mt-1.5 text-xs">
									Select the appropriate access level for this user
								</p>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field
						name="department"
						validators={{ onBlur: addVendorUserSchema.shape.department }}
					>
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>
									Department <RequiredStar />
								</FieldLabel>
								<Select
									value={field.state.value || undefined}
									onValueChange={(v) => {
										field.handleChange(v);
										field.handleBlur();
									}}
									disabled={
										!organizationId ||
										departmentsLoading ||
										(departments.length === 0 && !departmentsLoading)
									}
								>
									<SelectTrigger id={field.name} className="w-full">
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										{departments.map((dept) => (
											<SelectItem key={dept.id} value={dept.id}>
												{`${dept.name} (${dept.location.name})`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{!organizationId ? (
									<p className="text-muted-foreground mt-1.5 text-xs">
										No organization is linked for department selection. Contact
										support if this should not appear.
									</p>
								) : departmentsLoading ? (
									<p className="text-muted-foreground mt-1.5 text-xs">
										Loading departments…
									</p>
								) : departments.length === 0 ? (
									<p className="text-muted-foreground mt-1.5 text-xs">
										No departments in this organization yet.
									</p>
								) : (
									<p className="text-muted-foreground mt-1.5 text-xs">
										Choose the department this user belongs to
									</p>
								)}
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<FormDialogFooter
						form={form}
						onCancel={() => handleOpenChange(false)}
						submitLabel={isEditMode ? "Save changes" : "Add User"}
						submitLoadingLabel={isEditMode ? "Saving..." : "Adding..."}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

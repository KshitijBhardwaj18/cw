"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { DEPARTMENT_TYPE_OPTIONS } from "@/constants/organization";
import { useDepartmentFormDialog } from "@/hooks/use-department-form-dialog";
import { departmentFormSchema } from "@/schemas/department.schema";

type DepartmentFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
};

export function DepartmentFormDialog({
	open,
	onOpenChange,
	organizationId,
}: DepartmentFormDialogProps) {
	const {
		form,
		isPending,
		handleOpenChange,
		locations,
		orgOccupations,
		orgMembers,
		onLocationsScrollToBottom,
		onOccupationsScrollToBottom,
		onMembersScrollToBottom,
	} = useDepartmentFormDialog({
		open,
		onOpenChange,
		organizationId,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Department</DialogTitle>
					<DialogDescription>
						Add a new department to this organization.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<FieldGroup>
						<form.Field
							name="locationId"
							validators={{ onChange: departmentFormSchema.shape.locationId }}
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
											Location <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => {
												field.handleChange(v as typeof field.state.value);
												form.setFieldValue("organizationOccupationId", "");
												form.setFieldValue("organizationSpecialtyId", "");
											}}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={isInvalid}
												disabled={isPending}
											>
												<SelectValue placeholder="Select location" />
											</SelectTrigger>
											<SelectContent
												onScrollToBottom={onLocationsScrollToBottom}
											>
												{locations.map((loc) => (
													<SelectItem key={loc.id} value={loc.id}>
														{loc.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="name"
							validators={{ onChange: departmentFormSchema.shape.name }}
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
											Department Name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											placeholder="e.g. Emergency"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											disabled={isPending}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="departmentType"
							validators={{
								onChange: departmentFormSchema.shape.departmentType,
							}}
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
											Department Type <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) =>
												field.handleChange(v as typeof field.state.value)
											}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={isInvalid}
												disabled={isPending}
											>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												{DEPARTMENT_TYPE_OPTIONS.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="costCenter">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Cost Center</FieldLabel>
									<Input
										id={field.name}
										placeholder="Cost center"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isPending}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="relatedUserIds">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Related Users</FieldLabel>
									<MultiSelect
										values={field.state.value ?? []}
										onValuesChange={(v) => field.handleChange(v)}
									>
										<MultiSelectTrigger disabled={isPending} className="w-full">
											<MultiSelectValue placeholder="Select users..." />
										</MultiSelectTrigger>
										<MultiSelectContent
											search={{
												placeholder: "Search users...",
												emptyMessage: "No users found",
											}}
											onScrollToBottom={onMembersScrollToBottom}
										>
											{orgMembers.map((m) => (
												<MultiSelectItem
													key={m.user.id}
													value={m.user.id}
													badgeLabel={m.user.name}
												>
													<span className="font-medium">{m.user.name}</span>
													<span className="text-muted-foreground ml-2 text-xs">
														{m.user.email}
													</span>
												</MultiSelectItem>
											))}
										</MultiSelectContent>
									</MultiSelect>
								</Field>
							)}
						</form.Field>

						<form.Field name="organizationOccupationId">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Occupation</FieldLabel>
									<MultiSelect
										values={field.state.value ? [field.state.value] : []}
										onValuesChange={(v) => {
											field.handleChange(v[0] ?? "");
											form.setFieldValue("organizationSpecialtyId", "");
										}}
										single
									>
										<MultiSelectTrigger disabled={isPending} className="w-full">
											<MultiSelectValue placeholder="Select occupation" />
										</MultiSelectTrigger>
										<MultiSelectContent
											search={{
												placeholder: "Search occupations...",
												emptyMessage: "No occupations found",
											}}
											onScrollToBottom={onOccupationsScrollToBottom}
										>
											{orgOccupations.map((o) => (
												<MultiSelectItem
													key={o.id}
													value={o.id}
													badgeLabel={
														o.occupation?.acronym ?? o.occupation?.name
													}
												>
													<span className="font-medium">
														{o.occupation?.name ?? o.occupation?.acronym}
													</span>
													{o.occupation?.acronym && (
														<span className="text-muted-foreground ml-2 text-xs">
															{o.occupation.acronym}
														</span>
													)}
												</MultiSelectItem>
											))}
										</MultiSelectContent>
									</MultiSelect>
								</Field>
							)}
						</form.Field>

						<form.Subscribe
							selector={(state) => state.values.organizationOccupationId}
						>
							{(selectedOccupationId) => {
								const selectedOccupation = orgOccupations.find(
									(o) => o.id === selectedOccupationId,
								);
								const specialtyOptions = selectedOccupation?.specialties ?? [];
								return (
									<form.Field name="organizationSpecialtyId">
										{(field) => (
											<Field>
												<FieldLabel htmlFor={field.name}>Specialty</FieldLabel>
												<MultiSelect
													values={field.state.value ? [field.state.value] : []}
													onValuesChange={(v) => field.handleChange(v[0] ?? "")}
													single
												>
													<MultiSelectTrigger
														disabled={isPending || !selectedOccupationId}
														className="w-full"
													>
														<MultiSelectValue
															placeholder={
																selectedOccupationId
																	? "Select specialty"
																	: "Select an occupation first"
															}
														/>
													</MultiSelectTrigger>
													<MultiSelectContent
														search={{
															placeholder: "Search specialties...",
															emptyMessage: "No specialties found",
														}}
													>
														{specialtyOptions.map((s) => (
															<MultiSelectItem
																key={s.id}
																value={s.id}
																badgeLabel={
																	s.specialty?.acronym ?? s.specialty?.name
																}
															>
																<span className="font-medium">
																	{s.specialty?.name ?? s.specialty?.acronym}
																</span>
																{s.specialty?.acronym && (
																	<span className="text-muted-foreground ml-2 text-xs">
																		{s.specialty.acronym}
																	</span>
																)}
															</MultiSelectItem>
														))}
													</MultiSelectContent>
												</MultiSelect>
											</Field>
										)}
									</form.Field>
								);
							}}
						</form.Subscribe>
					</FieldGroup>

					<FormDialogFooter
						form={form}
						submitLabel="Add Department"
						submitLoadingLabel="Adding..."
						onCancel={() => handleOpenChange(false)}
						isPending={isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

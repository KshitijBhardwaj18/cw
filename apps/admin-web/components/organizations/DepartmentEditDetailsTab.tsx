"use client";

import { Button } from "@repo/ui/components/button";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { DEPARTMENT_TYPE_OPTIONS } from "@/constants/organization";
import type { useDepartmentEditForm } from "@/hooks/use-department-edit-dialog";
import { departmentFormSchema } from "@/schemas/department.schema";
import { AddDepartmentUserDialog } from "./AddDepartmentUserDialog";

type DepartmentEditDetailsTabProps = {
	organizationId: string;
	form: ReturnType<typeof useDepartmentEditForm>["form"];
	isPendingDetails: boolean;
	handleOpenChange: (open: boolean) => void;
	locations: { id: string; name: string }[];
	orgOccupations: {
		id: string;
		occupation?: { name?: string | null; acronym?: string | null };
		specialties?: {
			id: string;
			specialty?: { name?: string | null; acronym?: string | null };
		}[];
	}[];
	orgMembers: {
		user: { id: string; name: string | null; email: string };
		role: string;
	}[];
	onLocationsScrollToBottom: () => void;
	onOccupationsScrollToBottom: () => void;
};

export function DepartmentEditDetailsTab({
	organizationId,
	form,
	isPendingDetails,
	handleOpenChange,
	locations,
	orgOccupations,
	orgMembers,
	onLocationsScrollToBottom,
	onOccupationsScrollToBottom,
}: DepartmentEditDetailsTabProps) {
	const [addUserOpen, setAddUserOpen] = useState(false);

	const handleAddRelatedUsers = (members: { user: { id: string } }[]) => {
		const newIds = members.map((m) => m.user.id);
		const current = form.getFieldValue("relatedUserIds") ?? [];
		form.setFieldValue("relatedUserIds", [...new Set([...current, ...newIds])]);
	};

	const handleRemoveRelatedUser = (userId: string) => {
		const current = form.getFieldValue("relatedUserIds") ?? [];
		form.setFieldValue(
			"relatedUserIds",
			current.filter((id: string) => id !== userId),
		);
	};

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-6 overflow-y-auto max-h-[calc(90vh-12rem)] pb-8"
			>
				<div>
					<h3 className="mb-4 font-semibold">Department Information</h3>
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<form.Field
							name="locationId"
							validators={{
								onChange: departmentFormSchema.shape.locationId,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
												disabled={isPendingDetails}
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
							validators={{
								onChange: departmentFormSchema.shape.name,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
											disabled={isPendingDetails}
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
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
												disabled={isPendingDetails}
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
										disabled={isPendingDetails}
									/>
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
										<MultiSelectTrigger
											disabled={isPendingDetails}
											className="w-full"
										>
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
														disabled={isPendingDetails || !selectedOccupationId}
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
				</div>

				<div>
					<div className="mb-2 flex items-center justify-between">
						<div>
							<h3 className="font-semibold">Related Users</h3>
							<p className="text-muted-foreground text-sm">
								Assign organization users to this department
							</p>
						</div>
						<Button
							type="button"
							size="sm"
							onClick={() => setAddUserOpen(true)}
							disabled={isPendingDetails}
						>
							<UserPlus className="mr-2 size-4" />
							Add User
						</Button>
					</div>

					<form.Subscribe selector={(state) => state.values.relatedUserIds}>
						{(relatedUserIds) => {
							const ids = relatedUserIds ?? [];
							const relatedUsers = ids
								.map((id: string) => orgMembers.find((m) => m.user.id === id))
								.filter(Boolean) as {
								user: { id: string; name: string | null; email: string };
								role: string;
							}[];
							return relatedUsers.length === 0 ? (
								<div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
									<UserPlus className="text-muted-foreground mb-3 size-12" />
									<p className="text-muted-foreground text-sm">
										No users assigned to this department yet.
									</p>
									<p className="text-muted-foreground mt-1 text-xs">
										Click &apos;Add User&apos; to assign organization users.
									</p>
								</div>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>User Name</TableHead>
												<TableHead>Email</TableHead>
												<TableHead className="w-[100px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{relatedUsers.map((m) => (
												<TableRow key={m.user.id}>
													<TableCell className="font-medium">
														{m.user.name ?? m.user.email}
													</TableCell>
													<TableCell className="text-muted-foreground">
														{m.user.email}
													</TableCell>
													<TableCell>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => handleRemoveRelatedUser(m.user.id)}
															disabled={isPendingDetails}
														>
															Remove
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							);
						}}
					</form.Subscribe>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPendingDetails}>
						{isPendingDetails ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</div>
			</form>

			<form.Subscribe selector={(state) => state.values.relatedUserIds}>
				{(relatedUserIds) => (
					<AddDepartmentUserDialog
						open={addUserOpen}
						onOpenChange={setAddUserOpen}
						organizationId={organizationId}
						existingUserIds={relatedUserIds ?? []}
						onAdd={handleAddRelatedUsers}
					/>
				)}
			</form.Subscribe>
		</>
	);
}

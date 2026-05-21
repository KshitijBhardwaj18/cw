"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	type CandidateWorkforceType,
	getLabel,
	INTERNAL_WORKFORCE_TYPES,
} from "@repo/shared";
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
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { Mail, User } from "lucide-react";
import { useInviteCandidateDialog } from "@/hooks/candidate/use-invite-candidate-dialog";
import { inviteCandidateSchema } from "@/schemas/talent-community.schema";

type InviteCandidateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
};

export function InviteCandidateDialog({
	open,
	onOpenChange,
	orgId,
}: InviteCandidateDialogProps) {
	const {
		form,
		occupationItems,
		specialties,
		isLoadingOccupations,
		isLoadingSpecialties,
		isPending,
		selectedOccupationId,
		submissionAttempts,
		handleOpenChange,
	} = useInviteCandidateDialog({ onOpenChange, orgId });

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Candidate</DialogTitle>
					<DialogDescription>
						Invite a candidate to complete their profile and submit required
						documentation
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="name"
						validators={{
							onBlur: inviteCandidateSchema.shape.name,
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
										Candidate Name <RequiredStar />
									</FieldLabel>
									<div className="relative">
										<User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
										<Input
											id={field.name}
											name={field.name}
											placeholder="Enter full name"
											className="pl-9"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
									</div>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="workforceType"
						validators={{
							onBlur: inviteCandidateSchema.shape.workforceType,
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
									<FieldLabel>
										Workforce Type <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => {
											field.handleChange(val as CandidateWorkforceType);
											field.handleBlur();
										}}
									>
										<SelectTrigger aria-invalid={isInvalid}>
											<SelectValue placeholder="Select workforce type" />
										</SelectTrigger>
										<SelectContent>
											{CANDIDATE_WORKFORCE_TYPE_OPTIONS.filter((opt) =>
												INTERNAL_WORKFORCE_TYPES.includes(
													opt.value as (typeof INTERNAL_WORKFORCE_TYPES)[number],
												),
											).map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{getLabel(
														CANDIDATE_WORKFORCE_TYPE_OPTIONS,
														opt.value,
													)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="occupationId"
						validators={{
							onBlur: inviteCandidateSchema.shape.occupationId,
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
									<FieldLabel>
										Occupation <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => {
											field.handleChange(val);
											form.setFieldValue("specialtyIds", []);
											field.handleBlur();
										}}
										disabled={isLoadingOccupations}
									>
										<SelectTrigger aria-invalid={isInvalid}>
											<SelectValue placeholder="e.g., Registered Nurse" />
										</SelectTrigger>
										<SelectContent>
											{occupationItems.map((item) => (
												<SelectItem
													key={item.occupationId}
													value={item.occupationId}
												>
													{item.occupation.name}
												</SelectItem>
											))}
											{occupationItems.length === 0 &&
												!isLoadingOccupations && (
													<SelectItem value="__none__" disabled>
														No occupations configured
													</SelectItem>
												)}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="specialtyIds">
						{(field) => (
							<Field>
								<FieldLabel>Specialties</FieldLabel>
								<MultiSelect
									values={field.state.value}
									onValuesChange={(vals) => field.handleChange(vals)}
								>
									<MultiSelectTrigger
										disabled={!selectedOccupationId || isLoadingSpecialties}
										className="w-full"
									>
										<MultiSelectValue placeholder="e.g., Critical Care, Emergency" />
									</MultiSelectTrigger>
									<MultiSelectContent>
										{specialties.map((s) => (
											<MultiSelectItem key={s.id} value={s.id}>
												{s.name}
											</MultiSelectItem>
										))}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<form.Field
						name="email"
						validators={{
							onBlur: inviteCandidateSchema.shape.email,
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
										Email Address <RequiredStar />
									</FieldLabel>
									<div className="relative">
										<Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
										<Input
											id={field.name}
											name={field.name}
											type="email"
											placeholder="candidate@email.com"
											className="pl-9"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
									</div>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="phoneNumber"
						validators={{
							onBlur: inviteCandidateSchema.shape.phoneNumber,
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
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<FormDialogFooter
						form={form}
						submitLabel="Send Invite"
						submitLoadingLabel="Sending Invite..."
						onCancel={() => handleOpenChange(false)}
						cancelLabel="Cancel"
						isPending={isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	type CandidateWorkforceType,
	getLabel,
} from "@repo/shared";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { CheckCircle2, Loader2, Mail, UserPlus } from "lucide-react";
import { useQuickOnboardCandidateDialog } from "@/hooks/candidate/use-quick-onboard-candidate-dialog";
import { quickOnboardCandidateSchema } from "@/schemas/vendor-quick-onboard.schema";

type QuickOnboardCandidateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
};

export function QuickOnboardCandidateDialog({
	open,
	onOpenChange,
	orgId,
}: QuickOnboardCandidateDialogProps) {
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
	} = useQuickOnboardCandidateDialog({ onOpenChange, orgId });

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader className="space-y-0 text-left">
					<div className="flex gap-4 pr-8">
						<div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-lg">
							<UserPlus className="text-primary size-5" />
						</div>
						<div className="min-w-0 space-y-1">
							<DialogTitle className="text-xl">
								Quick Onboard Candidate
							</DialogTitle>
							<DialogDescription>
								Send an invitation to onboard a new candidate
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field
							name="firstName"
							validators={{
								onBlur: quickOnboardCandidateSchema.shape.firstName,
							}}
						>
							{(field) => {
								const isInvalid =
									submissionAttempts > 0 && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											First Name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											autoComplete="given-name"
											placeholder="Enter first name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="lastName"
							validators={{
								onBlur: quickOnboardCandidateSchema.shape.lastName,
							}}
						>
							{(field) => {
								const isInvalid =
									submissionAttempts > 0 && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Last Name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											autoComplete="family-name"
											placeholder="Enter last name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field
							name="occupationId"
							validators={{
								onBlur: quickOnboardCandidateSchema.shape.occupationId,
							}}
						>
							{(field) => {
								const isInvalid =
									submissionAttempts > 0 && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>
											Occupation <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(val) => {
												field.handleChange(val);
												form.setFieldValue("specialtyId", "");
											}}
											disabled={isLoadingOccupations}
										>
											<SelectTrigger aria-invalid={isInvalid}>
												<SelectValue placeholder="Select occupation" />
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="specialtyId"
							validators={{
								onBlur: quickOnboardCandidateSchema.shape.specialtyId,
							}}
						>
							{(field) => {
								const isInvalid =
									submissionAttempts > 0 && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>
											Specialty <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(val) => field.handleChange(val)}
											disabled={!selectedOccupationId || isLoadingSpecialties}
										>
											<SelectTrigger aria-invalid={isInvalid}>
												<SelectValue placeholder="Select specialty" />
											</SelectTrigger>
											<SelectContent>
												{specialties.map((s) => (
													<SelectItem key={s.id} value={s.id}>
														{s.name}
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
					</div>

					<form.Field
						name="workforceType"
						validators={{
							onBlur: quickOnboardCandidateSchema.shape.workforceType,
						}}
					>
						{(field) => {
							const isInvalid =
								submissionAttempts > 0 && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>
										Workforce Type <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) =>
											field.handleChange(val as CandidateWorkforceType)
										}
									>
										<SelectTrigger aria-invalid={isInvalid}>
											<SelectValue placeholder="Select workforce type" />
										</SelectTrigger>
										<SelectContent>
											{CANDIDATE_WORKFORCE_TYPE_OPTIONS.map((opt) => (
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
						name="email"
						validators={{
							onBlur: quickOnboardCandidateSchema.shape.email,
						}}
					>
						{(field) => {
							const isInvalid =
								submissionAttempts > 0 && !field.state.meta.isValid;
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
											autoComplete="email"
											placeholder="Enter email address"
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
							onBlur: quickOnboardCandidateSchema.shape.phoneNumber,
						}}
					>
						{(field) => {
							const isInvalid =
								submissionAttempts > 0 && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Phone Number <RequiredStar />
									</FieldLabel>
									<PhoneInput
										id={field.name}
										name={field.name}
										autoComplete="tel"
										placeholder="(555) 123-4567"
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

					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<DialogFooter className="gap-2 border-t pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => handleOpenChange(false)}
									disabled={isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!canSubmit || isSubmitting || isPending}
								>
									{isSubmitting || isPending ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Submitting…
										</>
									) : (
										<>
											<CheckCircle2 className="size-4" />
											Submit
										</>
									)}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}

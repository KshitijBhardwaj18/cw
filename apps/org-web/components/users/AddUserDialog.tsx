"use client";

import type { MemberRole } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldContent, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Check, Loader2 } from "lucide-react";
import { useAddUserDialog } from "@/hooks/use-add-user-dialog";
import type { EnrollOrgUserPayload } from "@/services/organizations.service";

interface AddUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (payload: EnrollOrgUserPayload) => void;
	isSubmitting?: boolean;
}

export function AddUserDialog({
	open,
	onOpenChange,
	onSave,
	isSubmitting = false,
}: AddUserDialogProps) {
	const { formData, setField, buildPayload, canSubmit, roleOptions } =
		useAddUserDialog(open);

	const handleSave = () => {
		const payload = buildPayload();
		if (!payload) return;
		onSave(payload);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add User</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 pt-4">
					<div className="grid grid-cols-1 gap-4">
						<Field>
							<FieldLabel>
								First Name <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Input
									placeholder="John"
									value={formData.firstName}
									onChange={(e) => setField("firstName", e.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>
								Last Name <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Input
									placeholder="Doe"
									value={formData.lastName}
									onChange={(e) => setField("lastName", e.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>
								Email <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Input
									type="email"
									placeholder="john.doe@example.com"
									value={formData.email}
									onChange={(e) => setField("email", e.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>Job title (optional)</FieldLabel>
							<FieldContent>
								<Input
									placeholder="e.g. Director of Nursing"
									value={formData.title}
									onChange={(e) => setField("title", e.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>
								Role <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Select
									value={formData.role}
									onValueChange={(val) => setField("role", val as MemberRole)}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										{roleOptions.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FieldContent>
						</Field>
					</div>
				</div>

				<DialogFooter className="gap-4 mt-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSubmitting || !canSubmit}>
						{isSubmitting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

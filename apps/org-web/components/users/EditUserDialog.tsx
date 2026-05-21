"use client";

import type { MemberRole } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Check, Loader2 } from "lucide-react";
import { useEditUserDialog } from "@/hooks/use-edit-user-dialog";
import type { UpdateOrgMemberPayload } from "@/services/organizations.service";
import type { User } from "@/types/user";

interface EditUserDialogProps {
	orgId: string;
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (payload: UpdateOrgMemberPayload) => void;
	isSubmitting?: boolean;
}

export function EditUserDialog({
	orgId,
	user,
	open,
	onOpenChange,
	onSave,
	isSubmitting = false,
}: EditUserDialogProps) {
	const {
		formData,
		setField,
		departmentOptions,
		buildPayload,
		canSubmit,
		toggleDepartment,
		isDeptChecked,
		roleOptions,
	} = useEditUserDialog({ open, user, orgId });

	const handleSave = () => {
		if (!user) return;
		const payload = buildPayload();
		if (!payload) return;
		onSave(payload);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 pt-4">
					<div className="grid grid-cols-1 gap-4">
						<Field>
							<FieldLabel>
								First Name <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Input
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
									value={formData.lastName}
									onChange={(e) => setField("lastName", e.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>
								Email Address <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<Input
									type="email"
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
							<FieldLabel>Role</FieldLabel>
							<FieldContent>
								<Select
									value={formData.role}
									onValueChange={(val) => setField("role", val as MemberRole)}
								>
									<SelectTrigger className="h-10 w-full justify-between">
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

						<FieldGroup className="gap-2">
							<FieldLabel>Department Assignment (Optional)</FieldLabel>
							<div className="rounded-lg border bg-background px-1 py-1">
								<ScrollArea className="h-48">
									<div className="p-2 space-y-1">
										{departmentOptions.length === 0 ? (
											<p className="text-sm text-muted-foreground px-2 py-4">
												No departments configured for this organization.
											</p>
										) : (
											departmentOptions.map((dept) => {
												const checked = isDeptChecked(dept.id);
												return (
													<div
														key={dept.id}
														className="flex items-center gap-3 rounded px-2 py-2 hover:bg-accent/50 cursor-pointer"
														onClick={() => toggleDepartment(dept.id)}
													>
														<Checkbox
															checked={checked}
															onCheckedChange={() => toggleDepartment(dept.id)}
														/>
														<span className="text-sm">{dept.name}</span>
													</div>
												);
											})
										)}
									</div>
								</ScrollArea>
							</div>
							<p className="text-xs text-muted-foreground pt-1">
								Leave all selected (or none) for access to all departments.
								Otherwise limit access to the departments you select.
							</p>
						</FieldGroup>
					</div>
				</div>

				<DialogFooter className="gap-4 mt-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="px-6"
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
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

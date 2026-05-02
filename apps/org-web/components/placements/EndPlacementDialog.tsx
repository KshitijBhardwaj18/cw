"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm } from "@tanstack/react-form";

interface EndPlacementDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	placementNumber: string;
	onConfirm: (terminationReason?: string) => void | Promise<void>;
	isPending?: boolean;
}

export function EndPlacementDialog({
	open,
	onOpenChange,
	placementNumber,
	onConfirm,
	isPending = false,
}: EndPlacementDialogProps) {
	const form = useForm({
		defaultValues: { reason: "" },
		onSubmit: async ({ value }) => {
			try {
				await onConfirm(value.reason.trim() || undefined);
				form.reset();
			} catch {
				// Parent shows error toast; keep dialog open.
			}
		},
	});

	const handleOpenChange = (next: boolean) => {
		if (!next) form.reset();
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>End Placement</DialogTitle>
					<DialogDescription>
						This will terminate placement{" "}
						<span className="font-medium">{placementNumber}</span>. This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="reason">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Reason (optional)</FieldLabel>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter reason for ending this placement..."
									rows={3}
									className="resize-none"
								/>
							</Field>
						)}
					</form.Field>

					<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" variant="destructive" disabled={isPending}>
							{isPending ? "Ending..." : "End Placement"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

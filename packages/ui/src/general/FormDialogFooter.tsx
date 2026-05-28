"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { Loader2 } from "lucide-react";

type FormDialogFooterProps = {
	// TanStack Form's Subscribe
	form: {
		Subscribe: (props: {
			selector: (state: { isSubmitting: boolean; canSubmit: boolean }) => {
				isSubmitting: boolean;
				canSubmit: boolean;
			};
			children: (props: {
				isSubmitting: boolean;
				canSubmit: boolean;
			}) => React.ReactNode;
		}) => React.ReactNode | Promise<React.ReactNode>;
	};
	submitLabel: string;
	submitLoadingLabel: string;
	onCancel?: () => void;
	cancelLabel?: string;
	isPending?: boolean;
	disabled?: boolean;
};

export function FormDialogFooter({
	form,
	submitLabel,
	submitLoadingLabel,
	onCancel,
	cancelLabel,
	isPending = false,
	disabled = false,
}: Readonly<FormDialogFooterProps>) {
	return (
		<form.Subscribe
			selector={(state) => ({
				isSubmitting: state.isSubmitting,
				canSubmit: state.canSubmit,
			})}
		>
			{({ isSubmitting, canSubmit }) => (
				<DialogFooter className="gap-2 pt-4">
					{onCancel && (
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							disabled={isPending}
						>
							{cancelLabel ?? "Cancel"}
						</Button>
					)}
					<Button
						type="submit"
						disabled={!canSubmit || isSubmitting || isPending || disabled}
					>
						{isSubmitting || isPending ? (
							<>
								<Loader2
									className="size-4 animate-spin"
									data-icon="inline-start"
								/>
								{submitLoadingLabel}
							</>
						) : (
							submitLabel
						)}
					</Button>
				</DialogFooter>
			)}
		</form.Subscribe>
	);
}

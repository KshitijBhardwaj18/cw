"use client";

import { useState } from "react";

/**
 * Freezes the entity passed into a dialog while it closes, so the parent can
 * clear `user`/`occupation`/etc. immediately while Radix finishes the exit
 * animation. That keeps `useForm({ defaultValues })` stable and avoids TanStack
 * Form's layout-effect (`formApi.update`) snapping values to create-mode when
 * `defaultValues` shallow-change and the form is still untouched.
 */
export function useDialogFormEntitySnapshot<TEntity>(
	open: boolean,
	entity: TEntity | undefined | null,
): TEntity | undefined | null {
	const [snapshot, setSnapshot] = useState<TEntity | undefined | null>(entity);
	const [lastOpen, setLastOpen] = useState(open);
	if (open !== lastOpen) {
		setLastOpen(open);
		if (open) {
			setSnapshot(entity);
		}
	}
	return snapshot;
}

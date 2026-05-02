"use client";

import type { ReactNode } from "react";

type DetailSectionProps = {
	label: string;
	children: ReactNode;
};

export function DetailSection({ label, children }: DetailSectionProps) {
	return (
		<div>
			<p className="text-muted-foreground text-sm">{label}</p>
			<div className="mt-1">{children}</div>
		</div>
	);
}

import type { ReactNode } from "react";

export function SectionLabel({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
			{children}
		</p>
	);
}

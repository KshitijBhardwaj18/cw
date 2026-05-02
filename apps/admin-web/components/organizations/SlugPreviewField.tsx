"use client";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { CheckCircle2, Globe, Info, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { envConfig } from "@/config";
import { useSlugSuggestion } from "@/queries/organizations.query";

type SlugPreviewFieldProps = {
	orgName: string;
	excludeOrganizationId?: string;
	onLoadingChange?: (isLoading: boolean) => void;
};

export function SlugPreviewField({
	orgName,
	excludeOrganizationId,
	onLoadingChange,
}: SlugPreviewFieldProps) {
	const [debouncedName] = useDebouncedValue(orgName.trim(), { wait: 400 });

	const { data, isFetching } = useSlugSuggestion(
		debouncedName,
		excludeOrganizationId,
	);

	const isLoading =
		orgName.trim().length >= 2 &&
		(orgName.trim() !== debouncedName || isFetching);

	useEffect(() => {
		onLoadingChange?.(isLoading);
	}, [isLoading, onLoadingChange]);

	if (debouncedName.length < 2) return null;

	return (
		<div className="space-y-1.5">
			<p className="text-muted-foreground text-xs font-medium">Portal URL</p>
			<div className="bg-muted/40 flex min-h-9 items-center gap-2 rounded-md border px-3 py-2">
				<Globe className="text-muted-foreground size-3.5 shrink-0" />
				{isFetching || !data ? (
					<>
						<Loader2 className="text-muted-foreground size-3.5 animate-spin" />
						<span className="text-muted-foreground text-sm">Generating…</span>
					</>
				) : (
					<>
						<span className="text-sm font-mono">
							<span className="text-foreground font-medium">{data.slug}</span>
							<span className="text-muted-foreground">
								.{envConfig.orgPortalDomain}
							</span>
						</span>
						{data.modified ? (
							<Info className="ml-auto size-3.5 shrink-0 text-amber-500" />
						) : (
							<CheckCircle2 className="ml-auto size-3.5 shrink-0 text-emerald-500" />
						)}
					</>
				)}
			</div>
			{data?.modified && (
				<p className="text-muted-foreground text-xs">
					The exact slug was already taken — a unique suffix has been added
					automatically.
				</p>
			)}
		</div>
	);
}

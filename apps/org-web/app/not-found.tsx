import {
	formatStaffLogicDocumentTitle,
	ORGANIZATION_PORTAL_DISPLAY_NAME,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { AlertCircle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: formatStaffLogicDocumentTitle(
		"Page not found",
		ORGANIZATION_PORTAL_DISPLAY_NAME,
	),
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,var(--muted),transparent)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,var(--background)_65%)]"
			/>

			<div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
				<Empty className="max-w-md border-0 bg-transparent p-8 shadow-none">
					<EmptyHeader className="max-w-none gap-4">
						<div className="flex flex-row items-start justify-center">
							<EmptyMedia
								className="mb-0 shrink-0 size-20 rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm [&_svg:not([class*='size-'])]:size-11"
								variant="default"
							>
								<AlertCircle
									className="text-primary"
									strokeWidth={1.5}
									aria-hidden
								/>
							</EmptyMedia>
						</div>

						<p className="text-muted-foreground font-medium uppercase">
							Error 404
						</p>

						<EmptyTitle className="text-2xl font-semibold tracking-tight">
							This page does not exist
						</EmptyTitle>

						<EmptyDescription className="max-w-sm text-base">
							The link may be broken, or the page may have been moved. Check the
							URL or return to your organization portal.
						</EmptyDescription>
					</EmptyHeader>

					<EmptyContent>
						<Button asChild variant="outline" size="lg">
							<Link href="/">
								<ArrowLeft className="size-4" aria-hidden />
								Portal home
							</Link>
						</Button>
					</EmptyContent>
				</Empty>
			</div>
		</div>
	);
}

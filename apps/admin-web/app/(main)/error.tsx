"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
	error,
	reset,
}: Readonly<{
	error: Error & { digest?: string };
	reset: () => void;
}>) {
	useEffect(() => {
		console.error("Admin Error Boundary (main) caught:", error);
	}, [error]);

	return (
		<div className="flex h-screen w-full items-center justify-center p-6">
			<Empty className="max-w-md border-none bg-transparent">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="bg-destructive/10 text-destructive mb-4"
					>
						<AlertCircle className="size-6" />
					</EmptyMedia>
					<EmptyTitle className="text-2xl font-bold tracking-tight">
						Admin Panel Error
					</EmptyTitle>
					<EmptyDescription className="text-muted-foreground text-base">
						An unexpected error occurred in the administration area. Please try
						refreshing the page or return to the main dashboard.
					</EmptyDescription>
				</EmptyHeader>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button
						variant="outline"
						className="gap-2 transition-all hover:bg-muted"
						onClick={() => reset()}
					>
						<RefreshCcw className="size-4" />
						Try Again
					</Button>
					<Button asChild className="gap-2 shadow-sm">
						<Link href="/dashboard">
							<ArrowLeft className="size-4" />
							Back to Dashboard
						</Link>
					</Button>
				</div>
			</Empty>
		</div>
	);
}

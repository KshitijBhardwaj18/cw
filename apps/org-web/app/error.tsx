"use client";

import { isCandidate, isOrganizationUser, isVendor } from "@repo/shared";
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
import { useSession } from "@/lib/auth-client";

export default function GlobalError({
	error,
	reset,
}: Readonly<{
	error: Error & { digest?: string };
	reset: () => void;
}>) {
	const { data: session } = useSession();

	useEffect(() => {
		console.error("Global Error Boundary caught:", error);
	}, [error]);

	const getDashboardLink = () => {
		if (!session?.user) return "/sign-in";

		const role = session.user.role;
		if (isCandidate(role)) return "/dashboard";
		if (isVendor(role)) return "/vendor/dashboard";
		if (isOrganizationUser(role)) return "/org/command-center";

		return "/dashboard";
	};

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
						Something went wrong
					</EmptyTitle>
					<EmptyDescription className="text-muted-foreground text-base">
						We encountered an unexpected error while processing your request.
						Our team has been notified.
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
						<Link href={getDashboardLink()}>
							<ArrowLeft className="size-4" />
							Back to Dashboard
						</Link>
					</Button>
				</div>
			</Empty>
		</div>
	);
}

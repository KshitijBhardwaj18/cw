"use client";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { Info, Loader2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	useCandidateMeProfile,
	useDismissProfileBanner,
} from "@/queries/candidate-profile.queries";

const PROFILE_LINK = "/profile";
const DOCUMENTS_LINK = "/document-wallet";

export function CandidateProfileCompleteBanner() {
	const profileQuery = useCandidateMeProfile();
	const dismissMutation = useDismissProfileBanner();

	if (profileQuery.isPending || !profileQuery.data?.showProfileBanner) {
		return null;
	}

	const handleDismiss = () => {
		dismissMutation.mutate(undefined, {
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Could not dismiss banner",
				);
			},
		});
	};

	return (
		<div className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
			<Card
				className={cn(
					"relative overflow-hidden border-blue-200/80 bg-blue-50/90 py-5 shadow-sm",
					"text-blue-950",
				)}
			>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="text-blue-700 hover:bg-blue-100/80 hover:text-blue-900 absolute right-2 top-2 size-8"
					onClick={handleDismiss}
					disabled={dismissMutation.isPending}
					aria-label="Dismiss"
				>
					{dismissMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<X className="size-4" aria-hidden />
					)}
				</Button>
				<div className="flex gap-4 pr-10 pl-4 sm:pl-6">
					<div className="text-blue-600 mt-0.5 shrink-0">
						<Info className="size-5" aria-hidden />
					</div>
					<div className="min-w-0 space-y-2">
						<h2 className="text-base font-semibold text-blue-950">
							Complete your profile to unlock more job matches
						</h2>
						<p className="text-sm leading-relaxed text-blue-900/85">
							Add your professional information and upload required documents to
							increase your visibility to employers.
						</p>
						<div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-medium">
							<Link
								href={PROFILE_LINK}
								className="text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
							>
								Complete Profile →
							</Link>
							<Link
								href={DOCUMENTS_LINK}
								className="text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
							>
								Upload Documents →
							</Link>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}

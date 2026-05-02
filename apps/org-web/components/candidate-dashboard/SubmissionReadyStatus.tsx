"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, FileCheck, Medal } from "lucide-react";
import {
	PRIORITY_READY_APPROVED_PCT,
	SUBMISSION_READY_APPROVED_PCT,
} from "@/constants/candidate/dashboard";
import { SubmissionReadyTier } from "./SubmissionReadyTier";

type SubmissionReadyStatusProps = {
	className?: string;
	tier1Complete: boolean;
	tier1MissingItems: { label: string; href: string }[];
	tier2Complete: boolean;
	tier3Complete: boolean;
	walletLoading: boolean;
	walletError: boolean;
	approvedPercent: number | null;
	pendingUpload: number;
	pendingVerification: number;
	expired: number;
	totalRequirements: number;
};

export function SubmissionReadyStatus({
	className,
	tier1Complete,
	tier1MissingItems,
	tier2Complete,
	tier3Complete,
	walletLoading,
	walletError,
	approvedPercent,
	pendingUpload,
	pendingVerification,
	expired,
	totalRequirements,
}: SubmissionReadyStatusProps) {
	const pct = approvedPercent ?? (totalRequirements === 0 ? 100 : 0);

	const tier2Description = walletError
		? "We could not load your document wallet. Open Document Wallet to retry."
		: tier1Complete
			? totalRequirements === 0
				? "No document requirements for your assignments yet."
				: `Required documents at ${pct}% approved (need ${SUBMISSION_READY_APPROVED_PCT}%+)`
			: "Complete your profile before document requirements apply.";

	const tier2Items: { label: string; href: string }[] = [];
	if (!tier1Complete) {
		tier2Items.push({
			label: "Complete profile (contact, role, specialties, locations)",
			href: "/profile",
		});
	}
	if (walletError) {
		tier2Items.push({
			label: "Retry loading document requirements",
			href: "/document-wallet",
		});
	}
	if (tier1Complete && !tier2Complete && !walletError) {
		if (totalRequirements > 0 && pct < SUBMISSION_READY_APPROVED_PCT) {
			tier2Items.push({
				label: `Upload and verify documents (${pct}% approved, need ${SUBMISSION_READY_APPROVED_PCT}%+)`,
				href: "/document-wallet",
			});
		}
	}

	const tier3Description = !tier2Complete
		? "Complete Tier 2 (submission ready) to unlock priority readiness."
		: tier2Complete && totalRequirements > 0
			? "No missing or expired items and strong approval rate."
			: "Clear missing uploads, resolve expirations, and reach a high approval rate.";

	const tier3Items: { label: string; href: string }[] = [];
	if (tier2Complete && !tier3Complete) {
		if (expired > 0) {
			tier3Items.push({
				label: `Renew or replace ${expired} expired document${expired === 1 ? "" : "s"}`,
				href: "/document-wallet",
			});
		}
		if (pendingUpload > 0) {
			tier3Items.push({
				label: `Upload ${pendingUpload} missing required document${pendingUpload === 1 ? "" : "s"}`,
				href: "/document-wallet",
			});
		}
		if (
			totalRequirements > 0 &&
			pendingUpload === 0 &&
			expired === 0 &&
			pct < PRIORITY_READY_APPROVED_PCT
		) {
			tier3Items.push({
				label: `Reach ${PRIORITY_READY_APPROVED_PCT}%+ approval (currently ${pct}%)`,
				href: "/document-wallet",
			});
		}
		if (pendingVerification > 0 && tier3Items.length === 0) {
			tier3Items.push({
				label: `${pendingVerification} document${pendingVerification === 1 ? "" : "s"} pending verification`,
				href: "/document-wallet",
			});
		}
	}

	if (walletLoading) {
		return (
			<Card className={cn("overflow-hidden", className)}>
				<CardHeader>
					<Skeleton className="h-7 w-64" />
					<Skeleton className="mt-2 h-4 w-full max-w-lg" />
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle className="text-xl font-bold">
					Submission Ready Status
				</CardTitle>
				<CardDescription>
					Completing required items improves your ability to apply and be
					submitted quickly.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<SubmissionReadyTier
					title="Tier 1: Minimum Ready"
					description={
						tier1Complete
							? "Profile is complete"
							: `${tier1MissingItems.length} item${tier1MissingItems.length === 1 ? "" : "s"} remaining`
					}
					status={tier1Complete ? "complete" : "incomplete"}
					icon={CheckCircle2}
					items={tier1Complete ? [] : tier1MissingItems}
				/>

				<SubmissionReadyTier
					title="Tier 2: Submission Ready"
					description={tier2Description}
					status={tier2Complete ? "complete" : "incomplete"}
					icon={FileCheck}
					items={tier2Items}
				/>

				<SubmissionReadyTier
					title="Tier 3: Priority Ready"
					description={tier3Description}
					status={
						!tier2Complete
							? "locked"
							: tier3Complete
								? "complete"
								: "incomplete"
					}
					icon={Medal}
					items={tier2Complete ? tier3Items : []}
				/>
			</CardContent>
		</Card>
	);
}

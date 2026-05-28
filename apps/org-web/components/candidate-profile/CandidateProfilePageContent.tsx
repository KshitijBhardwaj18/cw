"use client";

import type { ProfileUser } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	type CandidateProfileEditIntent,
	parseProfileEditIntent,
} from "@/constants/candidate/profile-edit-deep-link";
import { useCandidateMeProfile } from "@/queries/candidate-profile.queries";
import { AssignmentActivityCard } from "./AssignmentActivityCard";
import { DocumentWalletCard } from "./DocumentWalletCard";
import { EditCandidateProfileDialog } from "./EditCandidateProfileDialog";
import { EditProfessionalInformationDialog } from "./EditProfessionalInformationDialog";
import { ProfessionalInformationCard } from "./ProfessionalInformationCard";
import { ProfileCard } from "./ProfileCard";
import { ResumeCard } from "./ResumeCard";
import { SavedJobsCard } from "./SavedJobsCard";
import { SettingsCard } from "./SettingsCard";

type ProfileSectionProps = {
	user: ProfileUser;
};

function CandidateProfilePageContent({ user }: Readonly<ProfileSectionProps>) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const profileQuery = useCandidateMeProfile();
	const [editIntent, setEditIntent] =
		useState<CandidateProfileEditIntent | null>(null);
	const resumeAnchorRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const parsed = parseProfileEditIntent(searchParams);
		if (parsed) {
			setEditIntent(parsed);
			router.replace("/profile", { scroll: false });
		}
	}, [searchParams, router]);

	const dismissIntent = useCallback(
		(kind: CandidateProfileEditIntent["edit"]) => {
			setEditIntent((prev) => (prev?.edit === kind ? null : prev));
		},
		[],
	);

	useEffect(() => {
		if (editIntent?.edit !== "resume") return;
		if (!profileQuery.isSuccess) return;
		const t = window.setTimeout(() => {
			resumeAnchorRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			toast.info("Upload your resume using the section below.");
			setEditIntent(null);
		}, 150);
		return () => clearTimeout(t);
	}, [editIntent, profileQuery.isSuccess]);

	if (profileQuery.isPending) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-64 w-full rounded-xl" />
				<Skeleton className="h-40 w-full rounded-xl" />
			</div>
		);
	}

	if (profileQuery.isError) {
		return (
			<Empty>
				<EmptyHeader>
					<AlertCircle className="mx-auto size-8 text-destructive" />
					<EmptyTitle>Failed to load profile</EmptyTitle>
					<EmptyDescription>
						{profileQuery.error instanceof Error
							? profileQuery.error.message
							: "Something went wrong. Please try again."}
					</EmptyDescription>
				</EmptyHeader>
				<Button variant="outline" onClick={() => profileQuery.refetch()}>
					Try Again
				</Button>
			</Empty>
		);
	}

	const profile = profileQuery.data;

	const handleRefresh = () => {
		router.refresh();
	};

	const contactDeepLink =
		editIntent?.edit === "contact"
			? {
					open: true as const,
					onOpenChange: (open: boolean) => {
						if (!open) dismissIntent("contact");
					},
				}
			: {};

	const professionalDeepLink =
		editIntent?.edit === "professional"
			? {
					open: true as const,
					onOpenChange: (open: boolean) => {
						if (!open) dismissIntent("professional");
					},
					focusSection: editIntent.focus,
				}
			: {};

	return (
		<div className="space-y-6">
			<ProfileCard
				user={user}
				profile={profile ?? null}
				editProfileSlot={
					<EditCandidateProfileDialog
						user={user}
						profile={profile ?? null}
						onSuccess={handleRefresh}
						{...contactDeepLink}
						trigger={
							<Button variant="outline" size="sm" className="gap-2">
								<Pencil className="size-3.5" />
								Edit
							</Button>
						}
					/>
				}
			/>

			<ProfessionalInformationCard
				profile={profile ?? null}
				editProfessionalSlot={
					profile ? (
						<EditProfessionalInformationDialog
							profile={profile}
							onSuccess={handleRefresh}
							{...professionalDeepLink}
							trigger={
								<Button variant="outline" size="sm" className="gap-2">
									<Pencil className="size-3.5" />
									Edit
								</Button>
							}
						/>
					) : null
				}
			/>

			<div ref={resumeAnchorRef} className="scroll-mt-24">
				<ResumeCard existingResumeKey={profile?.resumeUrl ?? null} />
			</div>

			<DocumentWalletCard organizationId={profile?.organizationId ?? null} />
			<SavedJobsCard organizationId={profile?.organizationId ?? null} />
			<AssignmentActivityCard />
			<SettingsCard />
		</div>
	);
}

export default CandidateProfilePageContent;

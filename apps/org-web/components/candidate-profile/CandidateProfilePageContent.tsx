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
import { useRouter } from "next/navigation";
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

function CandidateProfilePageContent({ user }: ProfileSectionProps) {
	const router = useRouter();
	const profileQuery = useCandidateMeProfile();

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

			<ResumeCard existingResumeKey={profile?.resumeUrl ?? null} />

			<DocumentWalletCard organizationId={profile?.organizationId ?? null} />
			<SavedJobsCard organizationId={profile?.organizationId ?? null} />
			<AssignmentActivityCard />
			<SettingsCard />
		</div>
	);
}

export default CandidateProfilePageContent;

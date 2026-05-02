"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidateMatchDetail } from "@/queries/candidate-matches.queries";
import { CandidateJobApplyPageContent } from "./CandidateJobApplyPageContent";

interface Props {
	jobId: string;
}

export function CandidateJobApplyClientPage({ jobId }: Props) {
	const profile = useCandidateOrganizationId();
	const jobQuery = useCandidateMatchDetail(jobId, {
		enabled: Boolean(profile.organizationId),
	});

	const isLoading = profile.isLoading || jobQuery.isPending;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-32 w-full rounded-lg" />
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-48 w-full rounded-lg" />
					<Skeleton className="h-48 w-full rounded-lg" />
					<Skeleton className="h-48 w-full rounded-lg" />
					<Skeleton className="h-48 w-full rounded-lg" />
				</div>
				<Skeleton className="h-20 w-full rounded-lg" />
			</div>
		);
	}

	if (profile.isReady && !profile.organizationId) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Profile incomplete</EmptyTitle>
					<EmptyDescription>
						Complete your onboarding before applying for jobs.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (jobQuery.isError || !jobQuery.data) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Job not found</EmptyTitle>
					<EmptyDescription>
						This job posting is no longer available.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const job = jobQuery.data;

	return (
		<CandidateJobApplyPageContent
			jobId={jobId}
			jobTitle={job.jobTitle}
			facilityName={job.facilityName}
			occupation={job.occupation ?? profile.occupationName ?? ""}
			specialty={job.specialty}
			candidateName={profile.name ?? ""}
			candidateEmail={profile.email ?? ""}
			candidatePhone={profile.phoneNumber ?? ""}
			yearsOfExperience={profile.yearsOfExperience}
		/>
	);
}

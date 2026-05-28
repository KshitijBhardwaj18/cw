"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidateMatchDetail } from "@/queries/candidate-matches.queries";
import { formatMatchSpecialtyLabel } from "@/utils/candidate/match-display";
import { CandidateJobApplyPageContent } from "./CandidateJobApplyPageContent";

interface Props {
	jobId: string;
}

export function CandidateJobApplyClientPage({ jobId }: Readonly<Props>) {
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
			<ConfigPageEmptyState
				hasSearch={false}
				emptyTitle="Profile incomplete"
				emptyMessage="Complete your onboarding before applying for jobs."
			/>
		);
	}

	if (jobQuery.isError || !jobQuery.data) {
		return (
			<ConfigPageEmptyState
				hasSearch={false}
				emptyTitle="Job not found"
				emptyMessage="This job posting is no longer available."
			/>
		);
	}

	const job = jobQuery.data;
	const isExternalCandidate = profile.isExternalCandidate ?? false;

	if (job.isApplied) {
		return (
			<ConfigPageEmptyState
				hasSearch={false}
				emptyTitle="Already applied"
				emptyMessage="You have already applied to this job. Check your applications for status."
			/>
		);
	}

	if (isExternalCandidate && job.isSubmittedForVendorReview) {
		return (
			<ConfigPageEmptyState
				hasSearch={false}
				emptyTitle="Already applied"
				emptyMessage="You have already applied to this job. Check your applications for status."
			/>
		);
	}

	return (
		<CandidateJobApplyPageContent
			jobId={jobId}
			jobTitle={job.jobTitle}
			facilityName={job.facilityName}
			occupation={job.occupation ?? profile.occupationName ?? ""}
			specialty={formatMatchSpecialtyLabel(job) ?? ""}
			candidateName={profile.name ?? ""}
			candidateEmail={profile.email ?? ""}
			candidatePhone={profile.phoneNumber ?? ""}
			experienceBand={profile.experienceBand}
			acceptanceCriteria={job.acceptanceCriteria}
			isExternalCandidate={isExternalCandidate}
		/>
	);
}

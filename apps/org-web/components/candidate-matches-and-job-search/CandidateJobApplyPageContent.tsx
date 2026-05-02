"use client";

import { DetailItem } from "@repo/ui/components/detail-item";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { Briefcase, User } from "lucide-react";
import {
	type CandidateJobApplyPageInput,
	useCandidateJobApplyPage,
} from "@/hooks/candidate/use-candidate-job-apply-page";
import { CandidateJobApplyQuestionnaireCard } from "./CandidateJobApplyQuestionnaireCard";
import { CandidateJobApplyReviewHeaderCard } from "./CandidateJobApplyReviewHeaderCard";
import { CandidateJobApplySectionCard } from "./CandidateJobApplySectionCard";
import { CandidateJobApplySubmitCard } from "./CandidateJobApplySubmitCard";
import { CandidateJobApplySummaryNoteCard } from "./CandidateJobApplySummaryNoteCard";
import { CandidateJobApplyTimeOffCard } from "./CandidateJobApplyTimeOffCard";

export type CandidateJobApplyPageContentProps = CandidateJobApplyPageInput;

export function CandidateJobApplyPageContent(
	props: CandidateJobApplyPageContentProps,
) {
	const apply = useCandidateJobApplyPage(props);

	return (
		<div className="space-y-6">
			<PageBackLink href={apply.backHref}>Back to Job Details</PageBackLink>

			<CandidateJobApplyReviewHeaderCard
				jobTitle={apply.jobTitle}
				facilityName={apply.facilityName ?? ""}
				isSubmitting={apply.isSubmitting}
			/>

			<div className="grid gap-4 sm:grid-cols-2">
				<CandidateJobApplySectionCard icon={User} title="Candidate Information">
					<DetailItem label="Name" value={apply.candidate.name} />
					<DetailItem label="Email" value={apply.candidate.email} />
					<DetailItem label="Phone" value={apply.candidate.phone} />
				</CandidateJobApplySectionCard>

				<CandidateJobApplySectionCard
					icon={Briefcase}
					title="Occupation &amp; Specialty"
				>
					<DetailItem label="Occupation" value={apply.occupation} />
					{apply.specialty && (
						<DetailItem label="Specialty" value={apply.specialty} />
					)}
				</CandidateJobApplySectionCard>

				<CandidateJobApplyQuestionnaireCard rows={apply.questionnaire} />

				<CandidateJobApplySummaryNoteCard
					value={apply.summaryNote}
					onChange={apply.setSummaryNote}
				/>

				<CandidateJobApplyTimeOffCard timeOff={apply.timeOff} />
			</div>

			<CandidateJobApplySubmitCard
				canSubmit={!apply.isSubmitting}
				onCancel={apply.goBackToJob}
				onSubmit={apply.handleSubmitApplication}
			/>
		</div>
	);
}

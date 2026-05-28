"use client";

import { DetailItem } from "@repo/ui/components/detail-item";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { Briefcase, User } from "lucide-react";
import { buildPlaceholderWalletItem } from "@/components/document-wallet/build-placeholder-wallet-item";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import {
	type CandidateJobApplyPageInput,
	useCandidateJobApplyPage,
} from "@/hooks/candidate/use-candidate-job-apply-page";
import { CandidateJobApplyComplianceCard } from "./CandidateJobApplyComplianceCard";
import { CandidateJobApplyQuestionnaireCard } from "./CandidateJobApplyQuestionnaireCard";
import { CandidateJobApplyReviewHeaderCard } from "./CandidateJobApplyReviewHeaderCard";
import { CandidateJobApplySectionCard } from "./CandidateJobApplySectionCard";
import { CandidateJobApplySubmitCard } from "./CandidateJobApplySubmitCard";
import { CandidateJobApplySummaryNoteCard } from "./CandidateJobApplySummaryNoteCard";
import { CandidateJobApplyTimeOffCard } from "./CandidateJobApplyTimeOffCard";

export type CandidateJobApplyPageContentProps = CandidateJobApplyPageInput;

export function CandidateJobApplyPageContent(
	props: Readonly<CandidateJobApplyPageContentProps>,
) {
	const apply = useCandidateJobApplyPage(props);

	const dialogItem = apply.uploadItem
		? buildPlaceholderWalletItem(apply.uploadItem)
		: null;

	return (
		<div className="space-y-6">
			<PageBackLink href={apply.backHref}>Back to Job Details</PageBackLink>

			<CandidateJobApplyReviewHeaderCard
				jobTitle={apply.jobTitle}
				facilityName={apply.facilityName ?? ""}
				isSubmitting={apply.isSubmitting}
				isReady={apply.canSubmitApplication}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

			<CandidateJobApplyComplianceCard
				items={apply.acceptanceCriteria}
				onUpload={apply.openUploadDialog}
				onMarkLinkSubmitted={apply.markLinkSubmitted}
				isMarkingLink={apply.isMarkingLink}
			/>

			<CandidateJobApplySubmitCard
				canSubmit={apply.canSubmitApplication}
				isSubmitting={apply.isSubmitting}
				onCancel={apply.goBackToJob}
				onSubmit={apply.handleSubmitApplication}
				submitLabel={apply.isExternalCandidate ? "Submit for me" : undefined}
			/>

			<DocumentWalletUploadDialog
				open={!!apply.uploadItem}
				onOpenChange={(o) => !o && apply.closeUploadDialog()}
				item={dialogItem}
				uploadMutation={apply.uploadMutation}
			/>
		</div>
	);
}

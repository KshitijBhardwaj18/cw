import { SubmissionDetailPageContent } from "@/components/submissions/SubmissionDetailPageContent";

type SubmissionDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function SubmissionDetailPage({
	params,
}: SubmissionDetailPageProps) {
	const { id } = await params;
	return <SubmissionDetailPageContent submissionId={id} />;
}

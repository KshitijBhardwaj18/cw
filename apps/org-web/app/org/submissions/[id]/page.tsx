import { SubmissionDetailPageContent } from "@/components/submissions/SubmissionDetailPageContent";

type SubmissionDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function SubmissionDetailPage({
	params,
}: Readonly<SubmissionDetailPageProps>) {
	const { id } = await params;
	return <SubmissionDetailPageContent submissionId={id} />;
}

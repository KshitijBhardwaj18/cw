import { WorkforceListDetailsPageContent } from "../../../../components/workforce-lists/WorkforceListDetailsPageContent";

type WorkforceListDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function WorkforceListDetailPage({
	params,
}: WorkforceListDetailPageProps) {
	const { id } = await params;
	return <WorkforceListDetailsPageContent listId={id} />;
}

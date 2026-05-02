import { MspDetailsPageContent } from "@/components/msps/MspDetailsPageContent";

type MspDetailPageProps = {
	params: Promise<{ mspId: string }>;
};

export default async function MspDetailPage({ params }: MspDetailPageProps) {
	const { mspId } = await params;
	return <MspDetailsPageContent mspId={mspId} />;
}

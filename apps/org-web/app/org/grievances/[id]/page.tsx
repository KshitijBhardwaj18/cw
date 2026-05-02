import { GrievanceDetailsPageContent } from "@/components/grievances/GrievanceDetailsPageContent";

type GrievanceDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function GrievanceDetailPage({
	params,
}: GrievanceDetailPageProps) {
	const { id } = await params;
	return <GrievanceDetailsPageContent key={id} grievanceId={id} />;
}

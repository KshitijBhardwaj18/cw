import { ProjectDetailsPageContent } from "../../../../components/projects/ProjectDetailsPageContent";

type ProjectDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({
	params,
}: Readonly<ProjectDetailPageProps>) {
	const { id } = await params;
	return <ProjectDetailsPageContent projectId={id} />;
}

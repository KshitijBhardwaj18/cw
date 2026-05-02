import type { Metadata } from "next";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";

export const metadata: Metadata = {
	title: "Projects",
	description:
		"Create and manage projects to organize requisitions and hiring initiatives",
};

export default function ProjectsPage() {
	return <ProjectsPageContent />;
}

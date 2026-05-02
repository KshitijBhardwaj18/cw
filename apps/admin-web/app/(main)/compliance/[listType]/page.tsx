import { complianceSlugToCategory } from "@repo/shared";
import { redirect } from "next/navigation";
import { ComplianceCategoryPageContent } from "@/components/compliance/ComplianceCategoryPageContent";

type ComplianceCategoryListPageProps = {
	params: Promise<{ listType: string }>;
};

export default async function ComplianceCategoryListPage({
	params,
}: ComplianceCategoryListPageProps) {
	const { listType } = await params;
	const category = complianceSlugToCategory(listType);

	if (!category) {
		redirect("/compliance");
	}

	return <ComplianceCategoryPageContent category={category} />;
}

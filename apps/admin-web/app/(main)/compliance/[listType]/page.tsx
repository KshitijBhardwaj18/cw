import {
	complianceSlugToCategory,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ComplianceCategoryPageContent } from "@/components/compliance/ComplianceCategoryPageContent";

type ComplianceCategoryListPageProps = {
	params: Promise<{ listType: string }>;
};

export async function generateMetadata({
	params,
}: ComplianceCategoryListPageProps): Promise<Metadata> {
	const { listType } = await params;
	const category = complianceSlugToCategory(listType);
	if (!category) {
		return { title: "Compliance" };
	}
	return { title: getComplianceListItemCategoryLabel(category) };
}

export default async function ComplianceCategoryListPage({
	params,
}: Readonly<ComplianceCategoryListPageProps>) {
	const { listType } = await params;
	const category = complianceSlugToCategory(listType);

	if (!category) {
		redirect("/compliance");
	}

	return <ComplianceCategoryPageContent category={category} />;
}

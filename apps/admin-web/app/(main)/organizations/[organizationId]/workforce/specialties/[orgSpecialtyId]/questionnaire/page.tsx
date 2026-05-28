import QuestionnaireDetailPageContent from "@/components/questionnaire/QuestionnaireDetailPageContent";

type PageProps = {
	params: Promise<{ organizationId: string; orgSpecialtyId: string }>;
};

export default async function SpecialtyQuestionnairePage({
	params,
}: Readonly<PageProps>) {
	const { organizationId, orgSpecialtyId } = await params;

	return (
		<QuestionnaireDetailPageContent
			organizationId={organizationId}
			questionnaireType="specialty"
			entityId={orgSpecialtyId}
		/>
	);
}

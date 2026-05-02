import QuestionnaireDetailPageContent from "@/components/questionnaire/QuestionnaireDetailPageContent";

type PageProps = {
	params: Promise<{ organizationId: string; orgOccupationId: string }>;
};

export default async function OccupationQuestionnairePage({
	params,
}: PageProps) {
	const { organizationId, orgOccupationId } = await params;

	return (
		<QuestionnaireDetailPageContent
			organizationId={organizationId}
			questionnaireType="occupation"
			entityId={orgOccupationId}
		/>
	);
}

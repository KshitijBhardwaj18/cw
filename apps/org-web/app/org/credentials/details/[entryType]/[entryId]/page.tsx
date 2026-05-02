import { CredentialEntryDetailsPageContent } from "@/components/credentials/CredentialEntryDetailsPageContent";
import type { CredentialEntryDetailType } from "@/types/credential-entry-details";

type CredentialEntryDetailsPageProps = {
	params: Promise<{ entryType: string; entryId: string }>;
};

export default async function CredentialEntryDetailsPage({
	params,
}: CredentialEntryDetailsPageProps) {
	const { entryType, entryId } = await params;

	const safeEntryType: CredentialEntryDetailType =
		entryType === "upcoming-placement" ? "upcoming-placement" : "credential";

	return (
		<CredentialEntryDetailsPageContent
			entryType={safeEntryType}
			entryId={entryId}
		/>
	);
}

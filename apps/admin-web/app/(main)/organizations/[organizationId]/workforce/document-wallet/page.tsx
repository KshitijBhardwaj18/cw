import ComplianceWalletTemplatesPageContent from "@/components/compliance-wallet-template/ComplianceWalletTemplatesPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function Page({ params }: PageProps) {
	const { organizationId } = await params;
	return (
		<ComplianceWalletTemplatesPageContent organizationId={organizationId} />
	);
}

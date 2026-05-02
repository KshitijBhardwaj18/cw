import ComplianceWalletDetailPageContent from "@/components/compliance-wallet-template/ComplianceWalletDetailPageContent";

type PageProps = {
	params: Promise<{ organizationId: string; walletId: string }>;
	searchParams: Promise<{ view?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { organizationId, walletId } = await params;
	const { view } = await searchParams;
	const readOnly = view === "true";

	return (
		<ComplianceWalletDetailPageContent
			organizationId={organizationId}
			walletId={walletId}
			readOnly={readOnly}
		/>
	);
}

type OrganizationTimeFinancialsPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationTimeFinancialsPage({
	params,
}: Readonly<OrganizationTimeFinancialsPageProps>) {
	await params;
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Time & Financials</h1>
			<p className="text-muted-foreground mt-2">
				Time and financial settings will be displayed here.
			</p>
		</div>
	);
}

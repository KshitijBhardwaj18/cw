type OrganizationWorkforcePageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationWorkforcePage({
	params,
}: Readonly<OrganizationWorkforcePageProps>) {
	await params;
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Workforce Management</h1>
			<p className="text-muted-foreground mt-2">
				Workforce management settings will be displayed here.
			</p>
		</div>
	);
}

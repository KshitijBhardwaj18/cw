import PageContainer from "@repo/ui/general/PageContainer";

const WorkforceConfigLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return <PageContainer>{children}</PageContainer>;
};

export default WorkforceConfigLayout;

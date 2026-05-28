import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { VendorAppSidebar } from "@/components/sidebar/VendorAppSidebar";

export type VendorMainShellProps = {
	title: string;
	children: React.ReactNode;
};

const VendorMainShell = ({
	title,
	children,
}: Readonly<VendorMainShellProps>) => {
	return (
		<MainLayoutShell
			sidebar={<VendorAppSidebar />}
			title={title}
			headerActions={<HeaderUserMenu />}
		>
			{children}
		</MainLayoutShell>
	);
};

export default VendorMainShell;

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Job Approvals",
};

export default function JobApprovalsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}

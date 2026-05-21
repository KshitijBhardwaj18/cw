import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tagging Rules",
};

export default function OrgTaggingRulesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}

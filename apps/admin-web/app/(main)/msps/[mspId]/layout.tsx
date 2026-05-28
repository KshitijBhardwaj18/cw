import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "MSP",
};

export default function MspDetailLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}

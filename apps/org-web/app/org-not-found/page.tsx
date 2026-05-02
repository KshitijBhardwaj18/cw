import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Organization Not Found",
};

export default function OrgNotFoundPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-full bg-muted">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-8 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<title>Organization</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
					/>
				</svg>
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">
					Organization not found
				</h1>
				<p className="text-muted-foreground max-w-sm text-sm">
					The organization you&apos;re looking for doesn&apos;t exist or has
					been deactivated. Check the URL and try again.
				</p>
			</div>
			<a
				href="mailto:support@stafflogic.com"
				className="text-primary text-sm underline-offset-4 hover:underline"
			>
				Contact support
			</a>
		</div>
	);
}

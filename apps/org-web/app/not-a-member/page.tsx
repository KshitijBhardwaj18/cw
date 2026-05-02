"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function NotAMemberPage() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

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
					<title>Access Denied</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
					/>
				</svg>
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
				<p className="text-muted-foreground max-w-sm text-sm">
					You are not an active member of this organization. Contact your
					organization admin if you think this is a mistake.
				</p>
			</div>
			<div className="flex flex-col items-center gap-3">
				<button
					type="button"
					onClick={handleSignOut}
					className="text-primary text-sm underline-offset-4 hover:underline"
				>
					Sign out and use a different account
				</button>
				<a
					href="mailto:support@stafflogic.com"
					className="text-muted-foreground text-xs underline-offset-4 hover:underline"
				>
					Contact support
				</a>
			</div>
		</div>
	);
}

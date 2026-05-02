"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import Image from "next/image";
import { useOrgContext } from "@/contexts/org-context";

interface AuthLayoutProps {
	children: React.ReactNode;
	contentClassName?: string;
}

export function AuthLayout({ children, contentClassName }: AuthLayoutProps) {
	const org = useOrgContext();

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
			<div className={contentClassName ?? "w-full max-w-md space-y-6"}>
				<div className="flex flex-col items-center justify-center gap-2 space-y-2 text-center">
					{org.logo ? (
						<Image
							src={org.logo}
							alt={org.name}
							width={120}
							height={40}
							className="size-12 w-auto object-contain rounded-full"
							unoptimized
						/>
					) : (
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
							{org.name.charAt(0).toUpperCase()}
						</div>
					)}
					<h1 className="text-2xl font-semibold">Welcome to {org.name}</h1>
				</div>

				<Card className="z-10 rounded-xl border-0 bg-card p-6 shadow-sm">
					<CardContent>{children}</CardContent>
				</Card>
			</div>
			<div
				className="pointer-events-none fixed bottom-0 left-0 right-0 z-[-1] h-[min(40vh,320px)] opacity-30"
				aria-hidden
			>
				<svg
					className="absolute bottom-0 left-0 h-full w-full"
					viewBox="0 0 1440 400"
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Background</title>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.15)"
						d="M0,200 C200,100 400,300 600,200 C800,100 1000,300 1200,200 C1400,100 1600,300 1800,200 L1800,400 L0,400 Z"
						style={{ animationDuration: "20s", animationDelay: "0s" }}
					/>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.2)"
						d="M0,250 C200,150 400,350 600,250 C800,150 1000,350 1200,250 C1400,150 1600,350 1800,250 L1800,400 L0,400 Z"
						style={{ animationDuration: "15s", animationDelay: "-2s" }}
					/>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.25)"
						d="M0,300 C200,200 400,400 600,300 C800,200 1000,400 1200,300 C1400,200 1600,400 1800,300 L1800,400 L0,400 Z"
						style={{ animationDuration: "12s", animationDelay: "-4s" }}
					/>
				</svg>
			</div>
		</div>
	);
}

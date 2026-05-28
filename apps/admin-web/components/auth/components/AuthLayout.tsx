"use client";
import { Card } from "@repo/ui/components/card";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
	return (
		<div className="flex min-h-screen bg-muted/20 items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-2 text-center flex items-center justify-center gap-2 flex-col">
					<Image
						src={"/images/logo.png"}
						alt="Logo"
						width={200}
						height={40}
						className="h-10 w-auto object-contain"
					/>
					<h1 className="text-2xl font-semibold">Welcome to Staff Logic</h1>
				</div>

				<Card className="bg-card z-10 border-0 rounded-xl p-6 shadow-sm ">
					<div className="space-y-6">{children}</div>
				</Card>

				<div className="text-center">
					<p className="text-muted-foreground text-xs">
						By continuing, you agree to our{" "}
						<Link
							href="/terms-of-service"
							className="hover:text-foreground underline underline-offset-4"
						>
							Terms
						</Link>{" "}
						and{" "}
						<Link
							href="/privacy-policy"
							className="hover:text-foreground underline underline-offset-4"
						>
							Privacy Policy
						</Link>
					</p>
				</div>
			</div>
			<div className="absolute inset-0 -z-10 opacity-30">
				<svg
					className="absolute bottom-0 left-0 w-full h-full"
					viewBox="0 0 1440 800"
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Wave Animation</title>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.15)"
						d="M0,400 C200,300 400,500 600,400 C800,300 1000,500 1200,400 C1400,300 1600,500 1800,400 L1800,800 L0,800 Z"
						style={{ animationDuration: "20s", animationDelay: "0s" }}
					></path>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.2)"
						d="M0,450 C200,350 400,550 600,450 C800,350 1000,550 1200,450 C1400,350 1600,550 1800,450 L1800,800 L0,800 Z"
						style={{ animationDuration: "15s", animationDelay: "-2s" }}
					></path>
					<path
						className="wave-animation"
						fill="rgba(73, 164, 183, 0.25)"
						d="M0,500 C200,400 400,600 600,500 C800,400 1000,600 1200,500 C1400,400 1600,600 1800,500 L1800,800 L0,800 Z"
						style={{ animationDuration: "12s", animationDelay: "-4s" }}
					></path>
				</svg>
			</div>
		</div>
	);
}

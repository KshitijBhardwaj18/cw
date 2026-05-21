"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { TINTED_METRIC_TONE_STYLES } from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import { Mail, MessageCircle, Phone } from "lucide-react";
import type { SupportContactChannel } from "@/components/candidate-support/mock-candidate-support";

const ICONS = {
	email: Mail,
	phone: Phone,
	chat: MessageCircle,
} as const;

export interface SupportHeroCardProps {
	title?: string;
	subtitle?: string;
	channels: readonly SupportContactChannel[];
}

export function SupportHeroCard({
	title = "How can we help?",
	subtitle = "Browse our FAQ or contact our support team",
	channels,
}: SupportHeroCardProps) {
	const sky = TINTED_METRIC_TONE_STYLES.sky;

	return (
		<Card className={cn("rounded-xl border py-6 shadow-sm", sky.card)}>
			<CardHeader className="flex flex-col gap-4">
				<div className="space-y-1.5">
					<CardTitle className={cn("text-xl", sky.title)}>{title}</CardTitle>
					<CardDescription className={cn("text-base font-normal", sky.value)}>
						{subtitle}
					</CardDescription>
				</div>

				<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
					{channels.map((channel) => {
						const Icon = ICONS[channel.id as keyof typeof ICONS] ?? Mail;
						return (
							<div
								key={channel.id}
								className={cn(
									"flex flex-col  gap-2 rounded-lg border border-sky-200/80 bg-white/70 px-4 py-3",
									"dark:border-sky-800/50 dark:bg-sky-950/30",
								)}
							>
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"flex size-8 shrink-0 items-center justify-center rounded-md",
											sky.iconWrap,
										)}
										aria-hidden
									>
										<Icon className="size-4" />
									</span>
									<span className={cn("text-sm font-medium", sky.title)}>
										{channel.label}
									</span>
								</div>
								<p className={cn("pl-10 text-sm", sky.value)}>
									{channel.value}
								</p>
							</div>
						);
					})}
				</div>
			</CardHeader>
		</Card>
	);
}

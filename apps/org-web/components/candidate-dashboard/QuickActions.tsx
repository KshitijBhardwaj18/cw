import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import Link from "next/link";
import { QUICK_ACTIONS } from "@/constants/candidate/dashboard";

export function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
					{QUICK_ACTIONS.map((action) => (
						<Button
							key={action.label}
							asChild
							variant="outline"
							className="h-auto justify-start gap-3 py-3 text-left text-sm sm:text-base"
						>
							<Link href={action.href}>
								<action.icon className="size-5 text-primary" />
								<span>{action.label}</span>
							</Link>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

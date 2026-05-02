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
				<div className="grid grid-cols-2 gap-4">
					{QUICK_ACTIONS.map((action) => (
						<Button
							key={action.label}
							asChild
							variant="outline"
							className="h-auto py-3 justify-start gap-3"
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

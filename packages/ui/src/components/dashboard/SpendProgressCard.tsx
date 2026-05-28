import { formatCurrency } from "@repo/shared";
import { Card, CardContent } from "../card";
import { Progress } from "../progress";

interface SpendProgressCardProps {
	current: number;
	total: number;
	title?: string;
}

const SpendProgressCard = ({
	current,
	total,
	title = "Expected Annual Spend Progress",
}: Readonly<SpendProgressCardProps>) => {
	const percentage = Math.round((current / total) * 100);

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-bold text-primary">{title}</h2>
			<Card className="p-2">
				<CardContent className="px-6 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-baseline gap-2 tracking-tighter">
							<span className="text-4xl font-black text-primary">
								{formatCurrency(current)}
							</span>
							<span className="text-xl font-normal text-muted-foreground">
								{formatCurrency(total)}
							</span>
						</div>
						<div className="text-3xl font-black text-primary">
							{percentage}%
						</div>
					</div>
					<Progress value={percentage} className="mt-4" />
				</CardContent>
			</Card>
		</div>
	);
};

export { SpendProgressCard };

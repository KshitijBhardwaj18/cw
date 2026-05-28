import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../card";

interface StatCardProps {
	title: string;
	icon?: LucideIcon;
	value: string | number;
	onClick?: () => void;
}

const StatCard = ({
	title,
	icon: Icon,
	value,
	onClick,
}: Readonly<StatCardProps>) => {
	return (
		<Card className="bg-card tracking-tight" onClick={onClick}>
			<CardContent className="flex flex-col items-center justify-center gap-2 p-2">
				{Icon && (
					<Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
				)}
				<p className="text-2xl font-bold text-primary">{value ?? "-"}</p>
				<h3 className="text-md font-medium text-primary">{title}</h3>
			</CardContent>
		</Card>
	);
};

export { StatCard };

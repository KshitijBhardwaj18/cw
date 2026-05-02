import { Card, CardContent } from "@repo/ui/components/card";

type CommandCenterTabPanelProps = {
	title: string;
	description: string;
};

export const CommandCenterTabPanel = ({
	title,
	description,
}: CommandCenterTabPanelProps) => {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">{title}</h3>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
};

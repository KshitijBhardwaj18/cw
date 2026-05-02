"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { ACTIVE_WORKFORCE_TYPE_CARDS } from "@/constants/command-center";
import { useActiveWorkforce } from "@/hooks/use-active-workforce";
import { ActiveWorkforceStatCard } from "./ActiveWorkforceStatCard";

export const ActiveWorkforceTab = () => {
	const {
		occupations,
		selectedOccupationId,
		workforceCountsByType,
		setSelectedOccupation,
	} = useActiveWorkforce();

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-1.5">
					<h3 className="text-xl font-semibold">Active Workforce</h3>
					<p className="text-muted-foreground text-sm">
						Workforce breakdown by employment type
					</p>
				</div>

				<Select
					value={selectedOccupationId}
					onValueChange={setSelectedOccupation}
				>
					<SelectTrigger className="w-56 rounded-none">
						<SelectValue placeholder="All Occupations" />
					</SelectTrigger>
					<SelectContent>
						{occupations.map((occupation) => (
							<SelectItem key={occupation.id} value={occupation.id}>
								{occupation.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{ACTIVE_WORKFORCE_TYPE_CARDS.map((card) => (
					<ActiveWorkforceStatCard
						key={card.key}
						card={card}
						count={workforceCountsByType[card.key]}
					/>
				))}
			</div>
		</div>
	);
};

"use client";

import {
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { ShiftRoutingTierType } from "@repo/shared";
import { CANDIDATE_WORKFORCE_TYPE_OPTIONS } from "@repo/shared";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSyncTiers } from "@/queries/shift-routing.queries";

export interface TierItem {
	id: string;
	workforceType: string;
	priorityOrder: number;
	isActive: boolean;
}

function buildInitialTiers(serverTiers: ShiftRoutingTierType[]): TierItem[] {
	if (serverTiers.length > 0) {
		return [...serverTiers]
			.sort((a, b) => a.priorityOrder - b.priorityOrder)
			.map((t) => ({
				id: t.id,
				workforceType: t.workforceType,
				priorityOrder: t.priorityOrder,
				isActive: t.isActive,
			}));
	}

	return CANDIDATE_WORKFORCE_TYPE_OPTIONS.map((o, i) => ({
		id: `temp-${o.value}`,
		workforceType: o.value,
		priorityOrder: i + 1,
		isActive: true,
	}));
}

export function useRoutingOrderTab(serverTiers: ShiftRoutingTierType[]) {
	const [localTiers, setLocalTiers] = useState<TierItem[]>([]);
	const [isDirty, setIsDirty] = useState(false);

	const syncMutation = useSyncTiers();

	useEffect(() => {
		setLocalTiers(buildInitialTiers(serverTiers));
		setIsDirty(false);
	}, [serverTiers]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setLocalTiers((prev) => {
			const oldIndex = prev.findIndex((t) => t.id === active.id);
			const newIndex = prev.findIndex((t) => t.id === over.id);
			return arrayMove(prev, oldIndex, newIndex).map((t, i) => ({
				...t,
				priorityOrder: i + 1,
			}));
		});
		setIsDirty(true);
	};

	const handleSaveOrder = () => {
		syncMutation.mutate(
			{
				tiers: localTiers.map((t) => ({
					workforceType: t.workforceType,
					priorityOrder: t.priorityOrder,
					isActive: t.isActive,
				})),
			},
			{
				onSuccess: () => {
					setIsDirty(false);
					toast.success("Routing priority saved");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			},
		);
	};

	return {
		localTiers,
		isDirty,
		sensors,
		handleDragEnd,
		handleSaveOrder,
		isSaving: syncMutation.isPending,
	};
}

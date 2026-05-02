"use client";

import { closestCenter, DndContext } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
	CandidateWorkforceType,
	ShiftRoutingTierType,
} from "@repo/shared";
import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { GripVertical, Save } from "lucide-react";
import { WORKFORCE_TYPE_DESCRIPTIONS } from "@/constants/shifts";
import type { TierItem } from "@/hooks/use-routing-order-tab";
import { useRoutingOrderTab } from "@/hooks/use-routing-order-tab";

interface SortableTierRowProps {
	tier: TierItem;
	index: number;
	readOnly?: boolean;
}

function SortableTierRow({
	tier,
	index,
	readOnly = false,
}: SortableTierRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: tier.id, disabled: readOnly });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 10 : undefined,
	};

	const label = getLabel(
		CANDIDATE_WORKFORCE_TYPE_OPTIONS,
		tier.workforceType as CandidateWorkforceType,
	);
	const description = WORKFORCE_TYPE_DESCRIPTIONS[tier.workforceType] ?? label;
	const initial = label.trim()[0]?.toUpperCase() ?? "W";

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-card flex items-center gap-4 rounded-lg border px-4 py-3 shadow-sm"
		>
			{readOnly ? (
				<span className="text-muted-foreground/30 w-6 shrink-0" aria-hidden />
			) : (
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab touch-none"
					aria-label="Drag to reorder"
				>
					<GripVertical className="size-4" />
				</button>
			)}

			<div
				className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
				style={{ backgroundColor: "hsl(var(--primary))" }}
			>
				{initial}
			</div>

			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold">{label}</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>

			<span className="text-muted-foreground shrink-0 text-sm">
				Priority {index + 1}
			</span>
		</div>
	);
}

interface RoutingOrderTabProps {
	orgId: string;
	tiers: ShiftRoutingTierType[];
	readOnly?: boolean;
}

export function RoutingOrderTab({
	orgId,
	tiers: serverTiers,
	readOnly = false,
}: RoutingOrderTabProps) {
	const {
		localTiers,
		isDirty,
		sensors,
		handleDragEnd,
		handleSaveOrder,
		isSaving,
	} = useRoutingOrderTab(orgId, serverTiers);

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-base font-semibold">
					Workforce Type Priority Order
				</h2>
				<p className="text-muted-foreground mt-0.5 text-sm">
					Drag and drop to reorder workforce types. Shifts will be routed from
					top to bottom based on this priority.
				</p>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={localTiers.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-2">
						{localTiers.map((tier, index) => (
							<SortableTierRow
								key={tier.id}
								tier={tier}
								index={index}
								readOnly={readOnly}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			<div className="flex items-center justify-between pt-2">
				<span className="text-muted-foreground text-sm">
					{localTiers.length} workforce type
					{localTiers.length !== 1 ? "s" : ""} configured
				</span>
				<Button
					onClick={handleSaveOrder}
					disabled={readOnly || !isDirty || isSaving}
				>
					<Save className="mr-2 size-4" />
					{isSaving ? "Saving..." : "Save Routing Order"}
				</Button>
			</div>
		</div>
	);
}

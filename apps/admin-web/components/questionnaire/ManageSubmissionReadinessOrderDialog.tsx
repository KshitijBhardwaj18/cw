"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { QUESTION_TYPE_OPTIONS } from "@/constants/questionnaire";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

export interface ManageSubmissionReadinessOrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	questions: QuestionWithTagging[];
	onSave: (questionIds: string[]) => Promise<void>;
}

function SortableQuestionRow({
	question,
	index,
	total,
	onMoveUp,
	onMoveDown,
}: Readonly<{
	question: QuestionWithTagging;
	index: number;
	total: number;
	onMoveUp: () => void;
	onMoveDown: () => void;
}>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: question.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const typeLabel = getLabel(QUESTION_TYPE_OPTIONS, question.type);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`bg-muted/50 flex items-center gap-4 rounded-lg border ${
				isDragging ? "z-10 opacity-90 shadow-md" : ""
			}`}
		>
			<Button
				type="button"
				variant="ghost"
				className="touch-none cursor-grab text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
				aria-label="Drag to reorder"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-5" />
			</Button>

			<Badge variant="secondary" className="size-7 shrink-0 p-0 text-xs">
				{index + 1}
			</Badge>

			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">{question.questionText}</p>
				<p className="text-muted-foreground text-xs">{typeLabel}</p>
			</div>

			<div className="flex shrink-0 flex-col gap-0.5">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label="Move up"
					disabled={index === 0}
					onClick={onMoveUp}
				>
					<ChevronUp className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label="Move down"
					disabled={index === total - 1}
					onClick={onMoveDown}
				>
					<ChevronDown className="size-4" />
				</Button>
			</div>
		</div>
	);
}

export function ManageSubmissionReadinessOrderDialog({
	open,
	onOpenChange,
	questions,
	onSave,
}: Readonly<ManageSubmissionReadinessOrderDialogProps>) {
	const [order, setOrder] = useState<string[]>(() =>
		[...questions]
			.sort((a, b) => {
				const aOrder = a.order ?? 9999;
				const bOrder = b.order ?? 9999;
				return aOrder - bOrder;
			})
			.map((q) => q.id),
	);
	const [isSaving, setIsSaving] = useState(false);

	const orderedQuestions = order
		.map((id) => questions.find((q) => q.id === id))
		.filter((q): q is QuestionWithTagging => q != null);

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setOrder((prev) => {
				const oldIndex = prev.indexOf(active.id as string);
				const newIndex = prev.indexOf(over.id as string);
				if (oldIndex === -1 || newIndex === -1) return prev;
				return arrayMove(prev, oldIndex, newIndex);
			});
		}
	}, []);

	const handleMoveUp = useCallback((index: number) => {
		if (index <= 0) return;
		setOrder((prev) => arrayMove(prev, index, index - 1));
	}, []);

	const handleMoveDown = useCallback(
		(index: number) => {
			if (index >= order.length - 1) return;
			setOrder((prev) => arrayMove(prev, index, index + 1));
		},
		[order.length],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(order);
			onOpenChange(false);
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		if (open && questions.length > 0) {
			setOrder(
				[...questions]
					.sort((a, b) => {
						const aOrder = a.order ?? 9999;
						const bOrder = b.order ?? 9999;
						return aOrder - bOrder;
					})
					.map((q) => q.id),
			);
		}
	}, [open, questions]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Submission Readiness Order</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Manage the order in which questions appear on the candidate&apos;s
						submission readiness screen. Only explicitly selected questions will
						be shown.
					</p>
				</DialogHeader>

				<div className="space-y-3">
					{orderedQuestions.length === 0 ? (
						<p className="text-muted-foreground py-8 text-center text-sm">
							No questions included in submission readiness.
						</p>
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={order}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-3">
									{orderedQuestions.map((question, index) => (
										<SortableQuestionRow
											key={question.id}
											question={question}
											index={index}
											total={orderedQuestions.length}
											onMoveUp={() => handleMoveUp(index)}
											onMoveDown={() => handleMoveDown(index)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={orderedQuestions.length === 0 || isSaving}
					>
						{isSaving ? "Saving..." : "Done"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

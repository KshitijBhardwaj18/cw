"use client";

import { Action, useAbility } from "@repo/casl";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge, type BadgeVariants } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Progress } from "@repo/ui/components/progress";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
	AlertCircle,
	CalendarDays,
	CheckCircle2,
	Clock,
	FileText,
	ShieldAlert,
	User,
} from "lucide-react";
import { toast } from "sonner";
import { CommandCenterService } from "@/services/command-center.service";
import type { RequisitionPerformanceTableItem } from "@/types/command-center";

export interface ComplianceItemDetailDialogProps {
	item: RequisitionPerformanceTableItem | null;
	isOpen: boolean;
	onClose: () => void;
}

export function ComplianceItemDetailDialog({
	item,
	isOpen,
	onClose,
}: ComplianceItemDetailDialogProps) {
	const ability = useAbility();
	const canUpdateRequisition = ability.can(Action.Update, "Requisition");

	const isOverdue = Boolean(item && (item.daysOverdue ?? 0) > 0);
	const statusLabel = item?.status ?? "Unknown";
	const blockerText =
		item?.documents?.find((d) => d.status !== "Complete")?.name ??
		"No blocker details available";
	const reminderMutation = useMutation({
		mutationFn: (payload: { requisitionId: string; placementId?: string }) =>
			CommandCenterService.queueRequisitionReminder(
				payload.requisitionId,
				payload.placementId,
			),
		onSuccess: () => {
			toast.success("Reminder queued successfully.");
		},
		onError: (error: unknown) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to queue reminder",
			);
		},
	});

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Requisition Detail</DialogTitle>
					<DialogDescription>
						Review requisition performance issue details
					</DialogDescription>
				</DialogHeader>

				{item ? (
					<div className="space-y-6">
						<Card className="border-amber-500/50 bg-amber-50">
							<CardHeader>
								<div className="flex items-center gap-2">
									<div className="flex size-8 items-center justify-center rounded-full bg-background ring-1 ring-border">
										<Clock className="size-4 text-amber-500" />
									</div>
									<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
										Operational Item
									</span>
								</div>
								<CardAction>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
											Status
										</span>
										<Badge variant="warning">{statusLabel}</Badge>
									</div>
								</CardAction>
								<CardTitle className="mt-2 wrap-break-word text-xl">
									{item.checklistItem}
								</CardTitle>
								<p className="text-muted-foreground text-sm font-medium">
									Requisition: {item.requisitionId} — {item.requisitionName}
								</p>
							</CardHeader>

							<CardContent>
								<div className="flex flex-wrap items-center gap-4 border-t pt-4">
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground text-xs font-medium">
											Item Type:
										</span>
										<Badge variant="outline" className="bg-white">
											{item.category}
										</Badge>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground text-xs font-medium">
											Priority:
										</span>
										<Badge variant="error">{item.priority}</Badge>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground text-xs font-medium">
											Due:
										</span>
										<Badge variant="error" className="font-medium">
											{isOverdue ? "Overdue" : "On Track"}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center gap-2">
								<FileText className="size-4 text-primary" />
								<CardTitle className="text-base">Item Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<DetailItem
									label="Compliance Item Name"
									value={item.checklistItem}
								/>
								<DetailItem
									label="Item Category"
									value={<Badge variant="secondary">{item.category}</Badge>}
								/>
								<DetailItem
									label="Assigned To"
									value={
										<div className="flex items-center gap-1.5">
											<User className="size-3.5" />
											<span>{item.assignedTo}</span>
										</div>
									}
								/>
								<DetailItem
									label="Completion Status"
									value={
										<div className="mt-1 space-y-2">
											<div className="flex items-center justify-between text-xs">
												<span>Progress</span>
												<span className="font-bold">{item.progress}%</span>
											</div>
											<Progress value={item.progress} className="h-2" />
										</div>
									}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center gap-2">
								<CalendarDays className="size-4 text-primary" />
								<CardTitle className="text-base">Timeline & Dates</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<DetailItem
									label="Due Date"
									value={
										<div className="flex items-center gap-1.5">
											<Clock className="size-3.5 text-destructive" />
											<span className="text-destructive">{item.dueDate}</span>
										</div>
									}
								/>
								<DetailItem
									label="Days Until Due"
									value={
										<Badge variant="error">
											{isOverdue
												? `${item.daysOverdue} days overdue`
												: "Not overdue"}
										</Badge>
									}
								/>
								<DetailItem
									label="Item Priority"
									value={<Badge variant="error">{item.priority}</Badge>}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center gap-2">
								<FileText className="size-4 text-primary" />
								<CardTitle className="text-base">
									Required Documents & Actions
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{item.documents && item.documents.length > 0 ? (
									item.documents.map((doc) => (
										<Card key={doc.name} className="py-3">
											<CardContent className="flex items-center justify-between px-3">
												<div className="flex items-center gap-3">
													<div
														className={cn(
															"flex size-8 items-center justify-center rounded-full bg-muted",
															doc.status === "Complete" &&
																"bg-emerald-100 text-emerald-600",
														)}
													>
														{doc.status === "Complete" ? (
															<CheckCircle2 className="size-4" />
														) : (
															<AlertCircle className="size-4 opacity-40" />
														)}
													</div>
													<div>
														<p className="text-sm font-medium">{doc.name}</p>
														<p className="text-muted-foreground text-xs">
															{doc.sub}
														</p>
													</div>
												</div>
												<Badge variant={doc.variant as BadgeVariants}>
													{doc.status}
												</Badge>
											</CardContent>
										</Card>
									))
								) : (
									<p className="text-muted-foreground text-sm">
										No required document details available.
									</p>
								)}
							</CardContent>
						</Card>

						<Alert
							variant="destructive"
							className="p-6 border-destructive bg-destructive/5"
						>
							<ShieldAlert className="size-4" />
							<AlertTitle className="font-semibold text-sm">
								Current Blocker
							</AlertTitle>
							<AlertDescription>
								<p className="text-foreground">{blockerText}</p>
								<div className="mt-4 flex gap-2">
									<Button
										size="sm"
										variant="destructive"
										disabled={
											!item?.reminderPlacementId ||
											!canUpdateRequisition ||
											reminderMutation.isPending
										}
										onClick={() => {
											if (!item?.reminderPlacementId || !canUpdateRequisition) {
												return;
											}
											reminderMutation.mutate({
												requisitionId: item.id,
												placementId: item.reminderPlacementId ?? undefined,
											});
										}}
									>
										Send Reminder
									</Button>
								</div>
								{!item?.reminderPlacementId ? (
									<p className="text-muted-foreground mt-3 text-xs">
										No reminder-eligible onboarding placement found for this
										requisition.
									</p>
								) : !canUpdateRequisition ? (
									<p className="text-muted-foreground mt-3 text-xs">
										You do not have permission to send reminders for this job.
									</p>
								) : null}
							</AlertDescription>
						</Alert>
					</div>
				) : (
					<Empty className="py-24 border-none">
						<EmptyHeader>
							<EmptyTitle>No Item Selected</EmptyTitle>
							<EmptyDescription>
								Please select a requisition from the table to view its
								compliance details.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}

				<Separator />

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

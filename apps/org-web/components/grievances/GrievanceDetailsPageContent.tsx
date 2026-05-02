"use client";

import { Action, useAbility } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ClipboardList, MapPin, Plus, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	GRIEVANCE_STATUS_LABEL,
	GRIEVANCE_TASK_CATEGORY_OPTIONS,
	GRIEVANCE_TYPE_LABEL,
	type GrievanceStatus,
	type GrievanceType,
	mapGrievanceTaskStatusToUi,
	nextGrievanceTaskApiStatus,
} from "@/constants/grievances";
import { useOrgContext } from "@/contexts/org-context";
import {
	useGrievanceDetail,
	useUpdateGrievanceTask,
} from "@/queries/grievances.queries";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import {
	formatGrievanceDate,
	formatGrievanceLongDate,
} from "@/utils/grievances";
import { CreateGrievanceTaskDialog } from "./CreateGrievanceTaskDialog";
import { GrievanceStatusFlowCard } from "./GrievanceStatusFlowCard";
import { GrievanceTaskItem } from "./GrievanceTaskItem";

interface GrievanceDetailsPageContentProps {
	grievanceId: string;
}

function typeBadgeVariant(type: GrievanceType): "warning" | "error" {
	return type === "BEHAVIORAL" ? "warning" : "error";
}

function statusBadgeVariant(
	status: GrievanceStatus,
): "warning" | "info" | "success" {
	if (status === "OPEN") return "warning";
	if (status === "IN_PROGRESS") return "info";
	return "success";
}

export function GrievanceDetailsPageContent({
	grievanceId,
}: GrievanceDetailsPageContentProps) {
	const ability = useAbility();
	const canEditGrievance = ability.can(Action.Update, "Grievance");

	const { id: orgId } = useOrgContext();
	const {
		data: detail,
		isLoading,
		isError,
	} = useGrievanceDetail(orgId, grievanceId);
	const updateTask = useUpdateGrievanceTask(orgId, grievanceId);
	const membersQuery = useOrgMembersForPicker(orgId);
	const [createTaskOpen, setCreateTaskOpen] = useState(false);

	const memberOptions = useMemo(
		() =>
			(membersQuery.data?.data ?? []).map((m) => ({
				value: m.user.id,
				label: m.user.name ?? m.user.email ?? m.user.id,
			})),
		[membersQuery.data],
	);

	const completedTaskCount = useMemo(
		() => detail?.tasks.filter((t) => t.status === "COMPLETED").length ?? 0,
		[detail?.tasks],
	);

	function cycleTaskState(
		taskId: string,
		current: "PENDING" | "IN_PROGRESS" | "COMPLETED",
	) {
		const next = nextGrievanceTaskApiStatus(current);
		updateTask.mutate(
			{ taskId, status: next },
			{
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to update task",
					);
				},
			},
		);
	}

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading grievance…</p>;
	}

	if (isError || !detail) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<ClipboardList />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Grievance not found</EmptyTitle>
					<EmptyDescription>
						This grievance does not exist or you do not have access.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href="/org/grievances">Back to Grievances</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const subtitle = `Grievance ID: ${detail.grievanceNumber} • Created ${formatGrievanceDate(detail.createdAt)}`;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Grievance Detail"
				total={1}
				itemLabel="grievance"
				itemLabelPlural="grievances"
				description={subtitle}
				backLink={{ href: "/org/grievances", label: "Back to Grievances" }}
				rightContent={
					<Badge
						variant={statusBadgeVariant(detail.status)}
						className="gap-1.5"
					>
						{GRIEVANCE_STATUS_LABEL[detail.status]}
					</Badge>
				}
			/>

			<GrievanceStatusFlowCard
				status={detail.status}
				completedTaskCount={completedTaskCount}
				totalTaskCount={detail.tasks.length}
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Grievance Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
								Grievance Type
							</p>
							<Badge variant={typeBadgeVariant(detail.type)}>
								{GRIEVANCE_TYPE_LABEL[detail.type]}
							</Badge>
						</div>
						<div className="space-y-2">
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
								Description
							</p>
							<div className="bg-muted/40 text-foreground rounded-lg border p-3 text-sm leading-relaxed">
								{detail.description}
							</div>
						</div>
						<DetailItem
							label="Created Date"
							value={formatGrievanceLongDate(detail.createdAt)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Linked Candidate &amp; Placement
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
								Candidate
							</p>
							<div className="flex items-center gap-3 rounded-lg border p-3">
								<Avatar className="size-11 border border-primary/20 bg-primary/10 text-primary">
									<AvatarFallback>
										<User className="size-5" />
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate font-semibold">{detail.workerName}</p>
									<p className="text-muted-foreground truncate text-sm">
										{detail.candidateRoleLabel}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
								Placement
							</p>
							{detail.placementId && detail.placementLabel ? (
								<div className="space-y-2 rounded-lg border border-sky-200/80 bg-sky-50/80 p-3 dark:border-sky-900/60 dark:bg-sky-950/30">
									<div className="flex gap-2">
										<MapPin className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-300" />
										<div className="min-w-0 space-y-1">
											<Link
												href={`/org/placements/${detail.placementId}`}
												className="text-primary block font-semibold leading-snug hover:underline"
											>
												{detail.placementLabel}
											</Link>
											{detail.placementHospitalName && (
												<p className="text-muted-foreground text-sm">
													{detail.placementHospitalName}
												</p>
											)}
											{detail.placementNumericId && (
												<p className="text-muted-foreground text-xs tabular-nums">
													Placement ID: #{detail.placementNumericId}
												</p>
											)}
										</div>
									</div>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									No placement linked to this grievance.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="border-b pb-4">
					<ConfigPageHeader
						title="Linked Tasks"
						total={detail.tasks.length}
						itemLabel="task"
						itemLabelPlural="tasks"
						description="Task completion updates the grievance status automatically"
						rightContent={
							canEditGrievance ? (
								<Button
									type="button"
									className="gap-1.5 font-semibold"
									onClick={() => setCreateTaskOpen(true)}
								>
									<Plus className="size-4" data-icon="inline-start" />
									Create Task
								</Button>
							) : undefined
						}
					/>
				</CardHeader>
				<CardContent className="space-y-3 pt-6">
					{detail.tasks.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No tasks yet. Create a task to track follow-up work.
						</p>
					) : (
						detail.tasks.map((task) => (
							<GrievanceTaskItem
								key={task.id}
								title={getLabel(GRIEVANCE_TASK_CATEGORY_OPTIONS, task.category)}
								description={task.description}
								assigneeName={task.assigneeName}
								createdAtIso={task.createdAt}
								uiState={mapGrievanceTaskStatusToUi(task.status)}
								completedAtIso={task.completedAt ?? undefined}
								canCycleState={canEditGrievance}
								onCycleState={() => cycleTaskState(task.id, task.status)}
							/>
						))
					)}
				</CardContent>
			</Card>

			{canEditGrievance ? (
				<CreateGrievanceTaskDialog
					open={createTaskOpen}
					onOpenChange={setCreateTaskOpen}
					orgId={orgId}
					grievanceId={grievanceId}
					memberOptions={memberOptions}
				/>
			) : null}
		</div>
	);
}

"use client";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Separator } from "@repo/ui/components/separator";
import { Bell, Calendar, MapPin, User } from "lucide-react";
import { WORKER_TYPE_BADGE_VARIANT } from "../constants";
import type { MissingTimeEntry } from "../types";

interface ViewMissingTimeWorkerDialogProps {
	worker: MissingTimeEntry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSendReminder?: (worker: MissingTimeEntry) => void;
}

export function ViewMissingTimeWorkerDialog({
	worker,
	open,
	onOpenChange,
	onSendReminder,
}: Readonly<ViewMissingTimeWorkerDialogProps>) {
	if (!worker) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl px-0">
				<DialogHeader className="px-6 mb-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
							<User className="text-primary size-5" />
						</div>
						<div className="flex-1">
							<DialogTitle className="text-xl font-bold tracking-tight">
								Worker Profile
							</DialogTitle>
							<DialogDescription className="text-sm font-medium">
								Detailed information for {worker.workerName}
							</DialogDescription>
						</div>
						<Badge variant={worker.status === "Overdue" ? "error" : "warning"}>
							{worker.status}
						</Badge>
					</div>
				</DialogHeader>

				<Separator />

				<div className="grid grid-cols-2 divide-x h-fit max-h-[60dvh] overflow-y-auto w-full px-6 py-6 gap-y-12 mb-4 scrollbar-hide">
					<div className="space-y-6 pr-8">
						<section className="space-y-3">
							<h3 className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider text-xs">
								<User className="size-3.5 text-muted-foreground" />
								Personal Info
							</h3>
							<Card className="bg-muted/50">
								<CardContent>
									<div className="flex flex-col gap-0.5">
										<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
											Full Name
										</p>
										<p className="text-md font-bold tracking-tight text-foreground">
											{worker.workerName}
										</p>
									</div>
									<div className="flex flex-col gap-0.5 mt-4">
										<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
											Worker Type
										</p>
										<Badge
											variant={
												WORKER_TYPE_BADGE_VARIANT[worker.workerType] ??
												"secondary"
											}
										>
											{worker.workerType}
										</Badge>
									</div>
								</CardContent>
							</Card>
						</section>

						<section className="space-y-3">
							<h3 className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider text-xs">
								<MapPin className="size-3.5 text-muted-foreground" />
								Current Assignment
							</h3>
							<Card className="bg-muted/50">
								<CardContent>
									<div className="flex flex-col gap-0.5">
										<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
											Location / Unit
										</p>
										<p className="text-md font-bold tracking-tight text-foreground">
											{worker.location} / {worker.department}
										</p>
									</div>
									<div className="flex flex-col gap-0.5 mt-4">
										<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
											Role / Position
										</p>
										<p className="text-sm font-bold tracking-tight text-foreground opacity-90">
											{worker.position}
										</p>
									</div>
								</CardContent>
							</Card>
						</section>
					</div>

					<div className="space-y-6 pl-8">
						<section className="space-y-3">
							<h3 className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider text-xs">
								<Calendar className="size-3.5 text-muted-foreground" />
								Missing Entries
							</h3>
							<Card className="bg-destructive/5 border-destructive/10">
								<CardContent>
									<div className="flex flex-col gap-2">
										<div className="flex items-baseline gap-1.5 flex-col">
											<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
												Overdue Days
											</p>
											<span className="text-2xl font-black text-destructive tracking-tighter decoration-destructive/20 underline-offset-4 decoration-4">
												{worker.daysOverdue}
											</span>
										</div>
										<div className="flex flex-col gap-2.5 mt-4">
											<p className="text-xs font-semibold text-muted-foreground uppercase opacity-80">
												Targeted Shift Dates
											</p>
											<div className="flex flex-wrap gap-1.5">
												{worker.missingDates.map((date) => (
													<Badge
														key={date}
														variant="outline"
														className="bg-white"
													>
														{date}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</section>

						<section className="space-y-3 border-t-2 pt-6 border-dashed border-border/70 mt-6">
							<Card className="bg-primary/5 border-primary/10">
								<CardContent>
									<div className="flex flex-col gap-0.5">
										<p className="text-xs font-black text-primary uppercase tracking-widest opacity-80 mb-1">
											Last Reported Activity
										</p>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="bg-white">
												{worker.lastSubmitted}
											</Badge>
											<span className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-50">
												Success
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</section>
					</div>
				</div>

				<Separator />

				<DialogFooter className="px-6 py-4 flex-row justify-between w-full h-fit flex-nowrap gap-x-2">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="text-sm font-semibold text-muted-foreground hover:bg-muted/70 transition-all rounded-lg"
					>
						Close Details
					</Button>
					{onSendReminder ? (
						<Button
							className="gap-2.5 text-sm font-semibold shadow-lg transition-all active:scale-95"
							onClick={() => {
								onOpenChange(false);
								onSendReminder(worker);
							}}
						>
							<Bell className="size-3.5 fill-white" />
							Send New Reminder
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

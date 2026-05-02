"use client";

import { Action, useAbility } from "@repo/casl";
import type { CandidateTalentType } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Separator } from "@repo/ui/components/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import {
	Award,
	Briefcase,
	Calendar,
	Check,
	CheckCircle2,
	FileText,
	Mail,
	Phone,
	UserPlus,
} from "lucide-react";
import { useCandidateProfileSheet } from "@/hooks/candidate/use-candidate-profile-sheet";
import { AssignWorkforceTypeDialog } from "./AssignWorkforceTypeDialog";
import { SectionLabel } from "./SectionLabel";

export function CandidateProfileSheet({
	orgId,
	candidate,
	open,
	onOpenChange,
}: {
	orgId: string;
	candidate: CandidateTalentType | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const ability = useAbility();
	const canAssignWorkforceType = ability.can(Action.Update, "TalentCommunity");

	const {
		profile,
		profileData,
		activityEvents,
		display,
		workforceTypeLabel,
		vendors,
		assignDialogOpen,
		setAssignDialogOpen,
		submitAssignWorkforceType,
		isAssignPending,
	} = useCandidateProfileSheet({ orgId, candidate, open });

	if (!profile) {
		return null;
	}

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent
					side="right"
					className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
				>
					<SheetHeader className="border-border shrink-0 border-b px-6 pb-4 pt-2 text-left">
						<SheetTitle className="text-lg">Candidate Profile</SheetTitle>
						<SheetDescription className="sr-only">
							Candidate details and activity
						</SheetDescription>
					</SheetHeader>

					<ScrollArea className="min-h-0 flex-1">
						<div className="space-y-8 px-6 py-6">
							<div className="flex flex-wrap items-start gap-3">
								<Avatar className="size-14 border-2 border-background shadow-sm">
									<AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
										{display.initials}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1 space-y-1">
									<p className="font-semibold text-lg leading-tight">
										{display.name}
									</p>
									<p className="text-muted-foreground text-sm">
										{display.title}
									</p>
									<Badge variant="success" className="mt-1">
										Active
									</Badge>
								</div>
							</div>

							<div>
								<SectionLabel>Contact information</SectionLabel>
								<div className="bg-muted/50 space-y-4 rounded-xl p-4">
									<div className="flex gap-3">
										<div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-md border shadow-sm">
											<Mail
												className="text-primary size-4"
												strokeWidth={1.75}
											/>
										</div>
										<div className="min-w-0 space-y-0.5">
											<p className="text-muted-foreground text-xs">Email</p>
											<p className="truncate text-sm">{display.email}</p>
										</div>
									</div>
									<div className="flex gap-3">
										<div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-md border shadow-sm">
											<Phone
												className="text-primary size-4"
												strokeWidth={1.75}
											/>
										</div>
										<div className="min-w-0 space-y-0.5">
											<p className="text-muted-foreground text-xs">Phone</p>
											<p className="text-sm">{display.phone}</p>
										</div>
									</div>
								</div>
							</div>

							<div>
								<SectionLabel>Professional details</SectionLabel>
								<div className="divide-border divide-y border">
									<div className="flex gap-3 p-3">
										<Briefcase className="text-primary mt-0.5 size-4 shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-muted-foreground text-xs">
												Occupation
											</p>
											<p className="font-semibold text-sm">
												{display.occupation}
											</p>
										</div>
									</div>
									<div className="flex gap-3 p-3">
										<Award className="text-primary mt-0.5 size-4 shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-muted-foreground text-xs">Specialty</p>
											<p className="font-semibold text-sm">
												{display.specialty}
											</p>
										</div>
									</div>
									<div className="flex gap-3 p-3">
										<Calendar className="text-primary mt-0.5 size-4 shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-muted-foreground text-xs">
												Date Added
											</p>
											<p className="font-semibold text-sm">
												{display.dateAdded}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div>
								<div className="mb-3 flex items-center justify-between gap-2">
									<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
										Workforce type
									</p>
									{!profile.workforceType && canAssignWorkforceType ? (
										<Button
											size="sm"
											className="shrink-0 gap-1.5"
											onClick={() => setAssignDialogOpen(true)}
											disabled={isAssignPending}
										>
											<UserPlus className="size-3.5" />
											Assign Workforce Type
										</Button>
									) : null}
								</div>
								{!profile.workforceType ? (
									<div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
										<div className="flex gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
												<UserPlus className="size-5 text-amber-700 dark:text-amber-400" />
											</div>
											<div className="min-w-0 flex-1 space-y-1">
												<p className="font-semibold text-sm">
													No Workforce Type Assigned
												</p>
												<p className="text-muted-foreground text-xs leading-relaxed">
													Assign a workforce type to enable candidate
													permissions and access control.
												</p>
												{canAssignWorkforceType ? (
													<Button
														size="sm"
														className="mt-2"
														onClick={() => setAssignDialogOpen(true)}
														disabled={isAssignPending}
													>
														Assign Now
													</Button>
												) : null}
											</div>
										</div>
									</div>
								) : (
									<div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
										<div className="flex gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm dark:bg-emerald-500">
												<Check className="size-5" strokeWidth={2.5} />
											</div>
											<div className="min-w-0 flex-1 space-y-1">
												<p className="font-semibold text-sm">
													Workforce Type Assigned
												</p>
												<p className="text-muted-foreground text-xs leading-relaxed">
													This candidate has been assigned as{" "}
													<strong className="text-foreground">
														{workforceTypeLabel}
													</strong>
													{profile.vendor?.name ? (
														<>
															{" "}
															for{" "}
															<strong className="text-foreground">
																{profile.vendor.name}
															</strong>
														</>
													) : null}
													.
												</p>
											</div>
											{canAssignWorkforceType ? (
												<Button
													variant="link"
													className="text-primary h-auto shrink-0 px-0 py-0"
													onClick={() => setAssignDialogOpen(true)}
													disabled={isAssignPending}
												>
													Change
												</Button>
											) : null}
										</div>
									</div>
								)}
							</div>

							<div>
								<SectionLabel>Compliance & documents</SectionLabel>
								<div className="bg-muted/40 space-y-3 rounded-xl p-4">
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-500" />
										<span className="font-medium">
											All required documents verified
										</span>
									</div>
									<div className="space-y-2">
										{profileData?.candidateCompliances?.map((doc) => (
											<div
												key={doc.id}
												className="bg-background flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 shadow-sm"
											>
												<div className="flex min-w-0 items-center gap-2">
													<FileText className="text-muted-foreground size-4 shrink-0" />
													<span className="truncate text-sm">
														{doc.documentName}
													</span>
												</div>
												<span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-500">
													{doc.status}
												</span>
											</div>
										))}
										{!profileData?.candidateCompliances?.length && (
											<p className="text-muted-foreground text-xs">
												No compliance documents found.
											</p>
										)}
									</div>
								</div>
							</div>

							<div>
								<SectionLabel>Recent activity</SectionLabel>
								<div className="space-y-0">
									{(() => {
										const logItems = activityEvents.map((e) => ({
											id: e.id,
											label: e.description ?? e.action,
											date: e.createdAt,
										}));

										const allItems = [...logItems]
											.filter((i) => Boolean(i.date))
											.sort(
												(a, b) =>
													new Date(b.date).getTime() -
													new Date(a.date).getTime(),
											);

										if (!allItems.length) {
											return (
												<p className="text-muted-foreground text-xs">
													No recent activity found.
												</p>
											);
										}

										return allItems.map((item, index) => (
											<div key={item.id}>
												{index > 0 && <Separator className="my-3" />}
												<div className="flex gap-3">
													<div
														className={cn(
															"mt-1.5 size-2 shrink-0 rounded-full",
															index === 0
																? "bg-primary"
																: "bg-muted-foreground/40",
														)}
													/>
													<div>
														<p className="text-sm">{item.label}</p>
														<p className="text-muted-foreground mt-0.5 text-xs">
															{format(new Date(item.date), "MMM d, yyyy")}
														</p>
													</div>
												</div>
											</div>
										));
									})()}
								</div>
							</div>
						</div>
					</ScrollArea>

					<SheetFooter className="border-border shrink-0 border-t bg-background px-6 py-4">
						<Button
							variant="outline"
							className="w-full"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{canAssignWorkforceType ? (
				<AssignWorkforceTypeDialog
					open={assignDialogOpen}
					onOpenChange={setAssignDialogOpen}
					candidateName={profile.user.name}
					vendors={vendors}
					isSubmitting={isAssignPending}
					onAssign={submitAssignWorkforceType}
				/>
			) : null}
		</>
	);
}

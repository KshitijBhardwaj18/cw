"use client";

import {
	BULK_INVITE_MAX_RECIPIENTS,
	type OrganizationTimezone,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { AlertTriangle, Calendar, Clock, Mail, Users } from "lucide-react";
import { useSendOrganizationInvitationDialog } from "@/hooks/use-send-organization-invitation-dialog";

export type InvitationTiming = "immediate" | "scheduled";

export type SendOrganizationInvitationDialogRecipient = {
	memberId: string;
	name: string;
	email: string;
};

type SendOrganizationInvitationDialogProps = {
	organizationId: string;
	recipients: SendOrganizationInvitationDialogRecipient[];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	orgTimezone: OrganizationTimezone;
	onSuccess?: () => void;
};

export function SendOrganizationInvitationDialog({
	organizationId,
	recipients,
	isOpen,
	onOpenChange,
	orgTimezone,
	onSuccess,
}: Readonly<SendOrganizationInvitationDialogProps>) {
	const {
		timing,
		setTiming,
		scheduledDate,
		setScheduledDate,
		scheduledTime,
		setScheduledTime,
		handleSubmit,
		handleOpenChange,
		isPending,
		isSubmitDisabled,
		orgTimezoneLabel,
		minDate,
	} = useSendOrganizationInvitationDialog({
		organizationId,
		open: isOpen,
		onOpenChange,
		recipients,
		orgTimezone,
		onSuccess,
	});

	const isBulk = recipients.length > 1;
	const isOverLimit = recipients.length > BULK_INVITE_MAX_RECIPIENTS;
	const single = recipients[0];

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle>
						{isBulk ? "Send Bulk Invitations" : "Send Organization Invitation"}
					</DialogTitle>
					<DialogDescription>
						{isBulk
							? "Send or schedule invitation emails for organization access"
							: "Send or schedule an invitation email for organization access"}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					{isBulk ? (
						<div className="bg-muted/50 flex items-center gap-4 rounded-lg border px-4 py-3">
							<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
								<Users className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-medium">
									{recipients.length} members selected
								</p>
								<p className="text-muted-foreground text-sm">
									Each member will receive their own invitation email
								</p>
							</div>
						</div>
					) : (
						<div className="bg-muted/50 flex items-center gap-4 rounded-lg border px-4 py-3">
							<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
								<Mail className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-medium truncate">{single?.name}</p>
								<p className="text-muted-foreground text-sm truncate">
									{single?.email}
								</p>
							</div>
						</div>
					)}

					{isOverLimit && (
						<div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
							<AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
							<p className="text-sm text-destructive">
								Maximum {BULK_INVITE_MAX_RECIPIENTS} members per batch. Please
								reduce your selection by{" "}
								{recipients.length - BULK_INVITE_MAX_RECIPIENTS} member
								{recipients.length - BULK_INVITE_MAX_RECIPIENTS !== 1
									? "s"
									: ""}
								.
							</p>
						</div>
					)}

					<div className="space-y-3">
						<Label className="text-base font-semibold">
							When should the invitation be sent?
						</Label>
						<RadioGroup
							value={timing}
							onValueChange={(v) => setTiming(v as InvitationTiming)}
							className="grid gap-3"
						>
							<div className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-lg border px-4 py-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
								<RadioGroupItem
									value="immediate"
									id="timing-immediate"
									className="mt-0.5"
								/>
								<Label
									htmlFor="timing-immediate"
									className="flex flex-1 cursor-pointer items-start gap-3"
								>
									<Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
									<div>
										<p className="font-medium">Send Immediately</p>
										<p className="text-muted-foreground text-sm">
											The invitation will be sent right away with organization
											access details
										</p>
									</div>
								</Label>
							</div>
							<div className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-lg border px-4 py-3 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
								<RadioGroupItem
									value="scheduled"
									id="timing-scheduled"
									className="mt-0.5"
								/>
								<div className="flex flex-1 flex-col gap-2">
									<Label
										htmlFor="timing-scheduled"
										className="flex cursor-pointer items-start gap-3"
									>
										<Calendar className="text-muted-foreground mt-0.5 size-4 shrink-0" />
										<div>
											<p className="font-medium">Schedule for Later</p>
											<p className="text-muted-foreground text-sm">
												Choose a specific date and time to send the invitation
											</p>
										</div>
									</Label>
									{timing === "scheduled" && (
										<div className="mt-3 space-y-3">
											{orgTimezoneLabel && (
												<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
													<Clock className="size-3.5 shrink-0" />
													Times are in{" "}
													<span className="font-medium">
														{orgTimezoneLabel}
													</span>
												</p>
											)}
											<div className="flex flex-wrap gap-4">
												<div className="min-w-0 flex-1 space-y-1.5">
													<Label
														htmlFor="schedule-date"
														className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
													>
														<Calendar className="size-4 shrink-0" />
														Date
													</Label>
													<DatePicker
														id="schedule-date"
														value={scheduledDate}
														onChange={setScheduledDate}
														min={minDate}
														placeholder="Pick a date"
													/>
												</div>
												<div className="min-w-0 flex-1 space-y-1.5">
													<Label
														htmlFor="schedule-time"
														className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
													>
														<Clock className="size-4 shrink-0" />
														Time
													</Label>
													<input
														id="schedule-time"
														type="time"
														value={scheduledTime}
														onChange={(e) => setScheduledTime(e.target.value)}
														className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													/>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter className="gap-3 sm:gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitDisabled || isOverLimit}
					>
						<Mail className="mr-2 size-4" />
						{isPending
							? "Sending..."
							: isBulk
								? timing === "scheduled"
									? `Schedule ${recipients.length} Invitations`
									: `Send ${recipients.length} Invitations`
								: timing === "scheduled"
									? "Schedule Invitation"
									: "Send Invitation"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

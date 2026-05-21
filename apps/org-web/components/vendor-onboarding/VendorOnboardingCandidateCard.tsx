import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Progress } from "@repo/ui/components/progress";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import {
	AlertCircleIcon,
	CalendarIcon,
	CheckCircle2Icon,
	ChevronDownIcon,
	ChevronUpIcon,
	ClockIcon,
	DownloadIcon,
	FileTextIcon,
	SendIcon,
} from "lucide-react";
import { useState } from "react";
import {
	DOC_INDICATOR_MAP,
	PROGRESS_INDICATOR_MAP,
	STATUS_VARIANT_MAP,
} from "@/constants/vendor/onboarding-tracker";
import type { OnboardingCandidate } from "@/types/vendor-onboarding-tracker";
import { VendorOnboardingDocumentItem } from "./VendorOnboardingDocumentItem";

interface VendorOnboardingCandidateCardProps {
	candidate: OnboardingCandidate;
	onSendReminder: (placementId: string) => void;
	isReminderPending: boolean;
}

export function VendorOnboardingCandidateCard({
	candidate,
	onSendReminder,
	isReminderPending,
}: VendorOnboardingCandidateCardProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card>
			<CardHeader className="flex flex-wrap items-center gap-4">
				<Avatar className="size-12 border">
					<AvatarFallback className="bg-muted text-primary font-semibold">
						{candidate.initials}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<h3 className="text-lg font-semibold truncate">{candidate.name}</h3>
					<p className="text-muted-foreground text-sm">{candidate.role}</p>
					<div className="flex items-center gap-4 mt-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<CalendarIcon className="size-3.5" />
							<span>Starts: {candidate.startDate}</span>
						</div>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<ClockIcon className="size-3.5" />
							<span>{candidate.daysRemaining} days</span>
						</div>
					</div>
				</div>
				<CardAction className="shrink-0">
					<Badge
						variant={STATUS_VARIANT_MAP[candidate.status]}
						className="space-x-1"
					>
						{candidate.status === "Cleared" && (
							<CheckCircle2Icon className="size-3" />
						)}
						{candidate.status === "In-Progress" && (
							<ClockIcon className="size-3" />
						)}
						{candidate.status === "Behind Schedule" && (
							<AlertCircleIcon className="size-3" />
						)}
						<span>{candidate.status}</span>
					</Badge>
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="size-1.5 rounded-full bg-muted-foreground" />
					<span>{candidate.location}</span>
				</div>

				<Separator />

				<div className="space-y-4 pt-2">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-semibold">Compliance Progress</h4>
						<span className="text-sm font-semibold">{candidate.progress}%</span>
					</div>
					<Progress
						value={candidate.progress}
						className={PROGRESS_INDICATOR_MAP[candidate.status]}
					/>

					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{candidate.documentsCompleted} of {candidate.totalDocuments}{" "}
							documents complete
						</span>
						<span>Due: {candidate.dueDate}</span>
					</div>

					<div className="flex gap-2">
						{candidate.detailedDocuments.map((doc) => (
							<Progress
								key={`${candidate.id}-${doc.name}`}
								value={100}
								className={cn("h-2", DOC_INDICATOR_MAP[doc.status])}
							/>
						))}
					</div>
				</div>

				<Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full gap-2 mt-4">
							<FileTextIcon className="size-4" />
							{isOpen ? "Hide Document Details" : "View Document Details"}
							{isOpen ? (
								<ChevronUpIcon className="size-4" />
							) : (
								<ChevronDownIcon className="size-4" />
							)}
						</Button>
					</CollapsibleTrigger>

					<CollapsibleContent className="space-y-4 mt-4">
						<div className="space-y-2">
							{candidate.detailedDocuments.map((doc) => (
								<VendorOnboardingDocumentItem
									key={`${candidate.id}-${doc.name}`}
									document={doc}
								/>
							))}
						</div>

						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="default"
								className="flex-1 gap-2"
								disabled={isReminderPending}
								onClick={() => onSendReminder(candidate.id)}
							>
								<SendIcon className="size-4" />
								Send Reminder
							</Button>
							<Button variant="outline" className="flex-1 gap-2">
								<DownloadIcon className="size-4" />
								Download Report
							</Button>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
}

"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { Alert } from "../components/alert";
import { Button } from "../components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/table";

export type BulkJobError = {
	row: number;
	email?: string;
	message: string;
};

export type BulkJobAlertStatus =
	| { phase: "idle" }
	| { phase: "processing"; processingLabel?: string }
	| {
			phase: "completed";
			summary: string;
			errors?: BulkJobError[];
	  }
	| { phase: "failed"; message: string };

type BulkJobAlertProps = {
	status: BulkJobAlertStatus;
	onDismiss: () => void;
	errorsTitle?: string;
};

export function BulkJobAlert({
	status,
	onDismiss,
	errorsTitle = "Bulk job errors",
}: Readonly<BulkJobAlertProps>) {
	const [isErrorsOpen, setIsErrorsOpen] = useState(false);

	if (status.phase === "idle") return null;

	const errors =
		status.phase === "completed" && status.errors && status.errors.length > 0
			? status.errors
			: null;

	return (
		<>
			<Alert
				className="flex items-center justify-between gap-3 border-primary/40 bg-primary/4 px-4 py-3"
				variant={status.phase === "failed" ? "destructive" : undefined}
			>
				<div className="flex min-w-0 flex-1 items-center gap-3">
					{status.phase === "processing" ? (
						<>
							<Loader2 className="size-5 shrink-0 animate-spin text-primary" />
							<span className="text-sm font-medium text-foreground">
								{status.processingLabel ?? "Processing…"}
							</span>
						</>
					) : null}
					{status.phase === "completed" ? (
						<span className="text-sm text-foreground">{status.summary}</span>
					) : null}
					{status.phase === "failed" ? (
						<span className="text-sm">{status.message}</span>
					) : null}
				</div>
				<div className="flex shrink-0 items-center gap-1">
					{errors ? (
						<Button
							type="button"
							variant="link"
							size="sm"
							className="h-auto p-0 text-sm"
							onClick={() => setIsErrorsOpen(true)}
						>
							View errors
						</Button>
					) : null}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onDismiss}
						aria-label="Dismiss"
					>
						<X className="size-4" />
					</Button>
				</div>
			</Alert>

			{errors ? (
				<Dialog open={isErrorsOpen} onOpenChange={setIsErrorsOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>{errorsTitle}</DialogTitle>
							<DialogDescription>
								{errors.length} row{errors.length === 1 ? "" : "s"} could not be
								processed. Review the details below.
							</DialogDescription>
						</DialogHeader>
						<div className="max-h-[60vh] overflow-auto rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">Row</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Reason</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{errors.map((e) => (
										<TableRow key={`${e.row}-${e.email ?? "unknown"}`}>
											<TableCell className="font-mono text-xs">
												{e.row}
											</TableCell>
											<TableCell className="text-sm">
												{e.email ?? "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{e.message}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsErrorsOpen(false)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			) : null}
		</>
	);
}

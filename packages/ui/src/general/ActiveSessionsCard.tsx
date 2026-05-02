"use client";

import type { SessionItem } from "@repo/shared";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";

export type ActiveSessionsCardProps = {
	currentSessionToken: string | undefined;
	sessions: SessionItem[];
	loadingSessions: boolean;
	onRevokeSession: (token: string) => void | Promise<void>;
};

function SessionRow({
	session,
	currentToken,
	onRevoke,
}: {
	session: SessionItem;
	currentToken: string | undefined;
	onRevoke: (token: string) => void;
}) {
	const isCurrent = session.token === currentToken;

	return (
		<div className="border-border flex items-start justify-between rounded-lg border p-4">
			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium">
						{isCurrent ? "Current Session" : "Session"}
					</p>
					{isCurrent && <Badge variant="default">Active</Badge>}
				</div>
				<p className="text-muted-foreground text-xs">
					{session.userAgent || "Unknown device"}
				</p>
				<p className="text-muted-foreground text-xs">
					IP: {session.ipAddress || "Unknown"}
				</p>
				<p className="text-muted-foreground text-xs">
					Created: {new Date(session.createdAt).toLocaleString()}
				</p>
				<p className="text-muted-foreground text-xs">
					Expires: {new Date(session.expiresAt).toLocaleString()}
				</p>
			</div>
			{!isCurrent && (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline" size="sm">
							Revoke
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Revoke this session?</AlertDialogTitle>
							<AlertDialogDescription>
								This will sign out the device. The session will need to sign in
								again to access the account.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								onClick={() => onRevoke(session.token)}
							>
								Revoke Session
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}

export function ActiveSessionsCard({
	currentSessionToken,
	sessions,
	loadingSessions,
	onRevokeSession,
}: ActiveSessionsCardProps) {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Active Sessions</CardTitle>
				<CardDescription>
					Manage your active sessions across different devices
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{loadingSessions ? (
					<div className="text-muted-foreground text-sm">
						Loading sessions...
					</div>
				) : sessions.length > 0 ? (
					<div className="space-y-3">
						{sessions.map((s) => (
							<SessionRow
								key={s.id}
								session={s}
								currentToken={currentSessionToken}
								onRevoke={onRevokeSession}
							/>
						))}
					</div>
				) : (
					<div className="text-muted-foreground text-sm">
						No active sessions found
					</div>
				)}
			</CardContent>
		</Card>
	);
}

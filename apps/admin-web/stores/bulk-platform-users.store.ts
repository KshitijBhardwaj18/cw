import { create } from "zustand";
import { UsersService } from "@/services/users.service";

export type BulkPlatformUsersStatus =
	| { phase: "idle" }
	| { phase: "processing"; jobId: string }
	| {
			phase: "completed";
			jobId: string;
			created: number;
			skipped: number;
			failed: number;
			errors?: Array<{ row: number; email?: string; message: string }>;
	  }
	| { phase: "failed"; jobId: string; message: string };

interface BulkPlatformUsersStore {
	status: BulkPlatformUsersStatus;
	startJob: (jobId: string) => void;
	dismiss: () => void;
}

let activeEventSource: EventSource | null = null;

function closeActiveEventSource() {
	if (activeEventSource) {
		activeEventSource.close();
		activeEventSource = null;
	}
}

export const useBulkPlatformUsersStore = create<BulkPlatformUsersStore>(
	(set, get) => ({
		status: { phase: "idle" },

		startJob: (jobId) => {
			closeActiveEventSource();

			set({ status: { phase: "processing", jobId } });

			const es = UsersService.createBulkPlatformUsersStream(jobId);
			activeEventSource = es;

			es.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data as string) as {
						phase: string;
						created?: number;
						skipped?: number;
						failed?: number;
						errors?: Array<{
							row: number;
							email?: string;
							message: string;
						}>;
						message?: string;
					};

					if (data.phase === "completed") {
						set({
							status: {
								phase: "completed",
								jobId,
								created: data.created ?? 0,
								skipped: data.skipped ?? 0,
								failed: data.failed ?? 0,
								errors: data.errors,
							},
						});
						closeActiveEventSource();
						return;
					}

					if (data.phase === "failed") {
						set({
							status: {
								phase: "failed",
								jobId,
								message: data.message ?? "Job failed",
							},
						});
						closeActiveEventSource();
						return;
					}
				} catch {
					set({
						status: {
							phase: "failed",
							jobId,
							message: "Received an unexpected response from the server.",
						},
					});
					closeActiveEventSource();
				}
			};

			es.onerror = () => {
				const current = get().status;
				closeActiveEventSource();
				if (current.phase === "processing") {
					set({
						status: {
							phase: "failed",
							jobId: current.jobId,
							message: "Connection lost. Please check job status and retry.",
						},
					});
				}
			};
		},

		dismiss: () => {
			closeActiveEventSource();
			set({ status: { phase: "idle" } });
		},
	}),
);

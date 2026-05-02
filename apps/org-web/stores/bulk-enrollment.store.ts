import { create } from "zustand";
import { OrganizationsService } from "@/services/organizations.service";

export type BulkEnrollmentStatus =
	| { phase: "idle" }
	| { phase: "processing"; organizationId: string; jobId: string }
	| {
			phase: "completed";
			organizationId: string;
			jobId: string;
			enrolled: number;
			skipped: number;
			failed: number;
			errors?: Array<{ row: number; email?: string; message: string }>;
	  }
	| {
			phase: "failed";
			organizationId: string;
			jobId: string;
			message: string;
	  };

interface BulkEnrollmentStore {
	status: BulkEnrollmentStatus;
	startJob: (organizationId: string, jobId: string) => void;
	dismiss: () => void;
}

let activeEventSource: EventSource | null = null;

function closeActiveEventSource() {
	if (activeEventSource) {
		activeEventSource.close();
		activeEventSource = null;
	}
}

export const useBulkEnrollmentStore = create<BulkEnrollmentStore>(
	(set, get) => ({
		status: { phase: "idle" },

		startJob: (organizationId, jobId) => {
			closeActiveEventSource();

			set({ status: { phase: "processing", organizationId, jobId } });

			const es = OrganizationsService.createBulkEnrollmentStream(jobId);
			activeEventSource = es;

			es.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data as string) as {
						phase: string;
						enrolled?: number;
						skipped?: number;
						failed?: number;
						errors?: Array<{ row: number; email?: string; message: string }>;
						message?: string;
					};

					if (data.phase === "completed") {
						set({
							status: {
								phase: "completed",
								organizationId,
								jobId,
								enrolled: data.enrolled ?? 0,
								skipped: data.skipped ?? 0,
								failed: data.failed ?? 0,
								errors: data.errors,
							},
						});
						closeActiveEventSource();
						return;
					}

					if (data.phase === "failed") {
						const message = data.message ?? "Job failed";
						set({
							status: {
								phase: "failed",
								organizationId,
								jobId,
								message,
							},
						});
						closeActiveEventSource();
						return;
					}
				} catch {
					const message = "Received an unexpected response from the server.";
					set({
						status: {
							phase: "failed",
							organizationId,
							jobId,
							message,
						},
					});
					closeActiveEventSource();
				}
			};

			es.onerror = () => {
				const current = get().status;
				closeActiveEventSource();
				if (current.phase === "processing") {
					const message = "Connection lost. Please check job status and retry.";
					set({
						status: {
							phase: "failed",
							organizationId: current.organizationId,
							jobId: current.jobId,
							message,
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

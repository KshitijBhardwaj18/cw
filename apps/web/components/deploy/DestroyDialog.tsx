"use client";

import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api";

/**
 * UX: kebab menu sits next to Redeploy on the LIVE env header. Destroy
 * is intentionally NOT a peer of Redeploy at the same visual weight —
 * a peer button invites misclicks, and tearing down infra has real
 * cost (5–10 min, possible $$$ impact). The kebab separates safe vs
 * dangerous and the AlertDialog adds a typed confirmation gate before
 * the API call fires.
 *
 * The destroy call returns the new Deployment row (kind=DESTROY). The
 * parent re-fetches the environment so its status flips to DESTROYING,
 * which surfaces the existing in-progress state component.
 */
export function DestroyDialog({
  projectId,
  envId,
  envType,
  projectName,
  onDestroyStarted,
}: {
  projectId: string;
  envId: string;
  envType: "staging" | "production";
  /** Used in the confirm copy + as the required typed value. */
  projectName: string;
  /** Called when the destroy was successfully enqueued. Parent should
   *  re-fetch env data so the UI flips to the DESTROYING branch. */
  onDestroyStarted: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typedConfirm, setTypedConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expected = `${projectName}/${envType}`;
  const canSubmit = typedConfirm.trim() === expected && !submitting;

  async function handleDestroy() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await api(
        `/api/projects/${projectId}/environments/${envId}/deployments/destroy`,
        { method: "POST" },
      );
      toast.success(`Destroying ${envType} environment...`);
      setDialogOpen(false);
      setTypedConfirm("");
      onDestroyStarted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start destroy",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              aria-label="Environment actions"
              className="h-8 w-8"
            >
              <MoreVertical size={16} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={14} className="mr-2" />
            Destroy environment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Destroy {envType} environment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will run <code className="font-mono text-xs">pulumi destroy</code>{" "}
              against this stack and permanently remove every AWS resource it
              created — VPC, ECS services, RDS instance, S3 bucket, ALB,
              everything. <strong>Data in the database and storage bucket
              will be irrecoverable.</strong>
              <br />
              <br />
              The project, GitHub connection, and env vars stay so you can
              redeploy later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Type{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {expected}
              </code>{" "}
              to confirm:
            </label>
            <input
              type="text"
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-destructive"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTypedConfirm("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDestroy}
              disabled={!canSubmit}
            >
              {submitting ? "Starting..." : `Destroy ${envType}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";

interface ProjectMember {
  id: string;
  role: "OWNER" | "DEPLOYER" | "VIEWER";
  user: { id: string; name: string; email: string; image: string | null };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface Props {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMembersSheet({ projectId, projectName, open, onOpenChange }: Props) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addUserId, setAddUserId] = useState<string | null>("");
  const [addRole, setAddRole] = useState<"OWNER" | "DEPLOYER" | "VIEWER">("VIEWER");
  const [adding, setAdding] = useState(false);

  async function loadMembers() {
    setLoading(true);
    try {
      const [m, u] = await Promise.all([
        api<ProjectMember[]>(`/api/admin/projects/${projectId}/members`),
        api<AdminUser[]>("/api/admin/users"),
      ]);
      setMembers(m);
      setAllUsers(u);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadMembers();
  }, [open, projectId]);

  async function updateRole(userId: string, role: "OWNER" | "DEPLOYER" | "VIEWER") {
    try {
      await api(`/api/admin/projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role } : m)),
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function removeMember(userId: string) {
    try {
      await api(`/api/admin/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success("Member removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function addMember() {
    if (!addUserId) return;
    setAdding(true);
    try {
      await api(`/api/admin/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: addUserId as string, role: addRole }),
      });
      toast.success("Member added");
      setAddUserId("");
      await loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  const memberUserIds = new Set(members.map((m) => m.user.id));
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{projectName}</SheetTitle>
          <SheetDescription>Manage project members</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3 px-4">
          <div className="flex items-center gap-2">
            <Select value={addUserId} onValueChange={setAddUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={addRole} onValueChange={(v) => setAddRole(v as "OWNER" | "DEPLOYER" | "VIEWER")}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="DEPLOYER">Deployer</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" disabled={!addUserId || adding} onClick={addMember}>
              Add
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!loading && members.length === 0 && (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          )}

          {!loading && members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 py-1">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <Select
                value={member.role}
                onValueChange={(v) => updateRole(member.user.id, v as "OWNER" | "DEPLOYER" | "VIEWER")}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="DEPLOYER">Deployer</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeMember(member.user.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

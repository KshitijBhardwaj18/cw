"use client";

import { useEffect, useState } from "react";
import { FolderGit2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import { ProjectMembersSheet } from "./ProjectMembersSheet";

interface AdminProject {
  id: string;
  name: string;
  slug: string;
  githubOwner: string | null;
  githubRepo: string | null;
  githubInstallationId: string | null;
  createdAt: string;
  _count: { members: number; environments: number };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);

  async function load() {
    try {
      const data = await api<AdminProject[]>("/api/admin/projects");
      setProjects(data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteProject(id: string) {
    try {
      await api(`/api/admin/projects/${id}`, { method: "DELETE" });
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Manage all projects across the organisation"
      />

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <EmptyState icon={FolderGit2} title="No projects yet" />
      )}

      {!loading && projects.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Environments</TableHead>
              <TableHead>GitHub repo</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{project.slug}</TableCell>
                <TableCell>{project._count.members}</TableCell>
                <TableCell>{project._count.environments}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {project.githubOwner && project.githubRepo
                    ? `${project.githubOwner}/${project.githubRepo}`
                    : "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">&#8943;</Button>} />
                      <DropdownMenuContent align="end">
                        <AlertDialogTrigger className="w-full">
                          <DropdownMenuItem variant="destructive">Delete project</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {project.name} and all its environments, deployments, and secrets. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => deleteProject(project.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedProject && (
        <ProjectMembersSheet
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          open={!!selectedProject}
          onOpenChange={(o) => { if (!o) setSelectedProject(null); }}
        />
      )}
    </div>
  );
}

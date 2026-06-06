"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FolderGit2,
  GitBranch,
  ArrowLeft,
  Settings,
  ScrollText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useMe";
import { signOut } from "@/lib/auth-client";

const USER_APP_URL =
  process.env.NEXT_PUBLIC_USER_APP_URL ?? "http://localhost:3000";

function AdminNavItem({
  href,
  icon: Icon,
  label,
  active,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  external?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon size={14} className="shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { me, loading } = useMe();

  useEffect(() => {
    if (!loading && (!me || me.systemRole !== "ADMIN")) {
      sessionStorage.removeItem("admin-session-valid");
    }
  }, [me, loading]);

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-48 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!me || me.systemRole !== "ADMIN") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Session expired. Sign in again to continue.
        </p>
        <Link
          href="/login"
          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    await signOut();
    window.location.href = `${USER_APP_URL}/login`;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-[52px] items-center border-b border-sidebar-border px-4">
          <span className="text-sm font-semibold tracking-tight">Heizen Admin</span>
        </div>
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="truncate text-xs text-muted-foreground">{me.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            <AdminNavItem
              href="/users"
              icon={Users}
              label="Users"
              active={pathname.startsWith("/users")}
            />
            <AdminNavItem
              href="/projects"
              icon={FolderGit2}
              label="Projects"
              active={pathname.startsWith("/projects")}
            />
            <AdminNavItem
              href="/github"
              icon={GitBranch}
              label="GitHub"
              active={pathname.startsWith("/github")}
            />
            <AdminNavItem
              href="/audit-log"
              icon={ScrollText}
              label="Audit log"
              active={pathname.startsWith("/audit-log")}
            />
            <AdminNavItem
              href="/system-config"
              icon={Settings}
              label="System config"
              active={pathname.startsWith("/system-config")}
            />
          </div>
          <div className="my-2 px-0.5">
            <Separator />
          </div>
          <div className="space-y-0.5">
            <AdminNavItem
              href={USER_APP_URL}
              icon={ArrowLeft}
              label="Back to app"
              active={false}
              external
            />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
    </div>
  );
}

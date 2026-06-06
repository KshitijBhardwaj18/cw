"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Me {
  id: string;
  name: string;
  email: string;
  image: string | null;
  systemRole: "ADMIN" | "MEMBER";
  projectMemberships: Array<{ projectId: string; role: "OWNER" | "DEPLOYER" | "VIEWER"; slug: string; name: string }>;
}

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    api<Me>("/api/me")
      .then((v) => { if (!cancelled) setMe(v); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e : new Error(String(e))); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return { me, loading, error };
}

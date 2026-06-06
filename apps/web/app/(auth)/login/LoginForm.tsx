"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign-in failed. Check your credentials.");
      } else {
        window.location.href = next;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Auto-detects your stack",
    "Deploys to AWS in minutes",
    "Monitors and alerts automatically",
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden min-h-screen flex-1 flex-col justify-between border-r border-border bg-card p-10 md:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <span className="text-sm font-semibold text-foreground">H</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Heizen</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-foreground">
            Ship infrastructure,{" "}
            <span className="text-muted-foreground">not YAML.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect your repo. We figure out the rest.
          </p>
        </div>
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check size={14} className="shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <span className="text-sm font-semibold">H</span>
            </div>
            <span className="text-lg font-semibold">Heizen</span>
          </div>

          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-center text-xs text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms of Service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

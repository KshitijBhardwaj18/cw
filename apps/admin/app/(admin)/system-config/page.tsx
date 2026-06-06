"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Presence, SystemConfig } from "@heizen/shared";

const REQUIRED_FOR_DEPLOY: Array<{ section: keyof SystemConfig; key: string; label: string }> = [
  { section: "github", key: "appId", label: "GitHub App ID" },
  { section: "github", key: "appPrivateKey", label: "GitHub App private key" },
  { section: "github", key: "webhookSecret", label: "GitHub webhook secret" },
  { section: "aws", key: "platformAccountId", label: "AWS account ID" },
  { section: "aws", key: "platformAccessKeyId", label: "AWS access key" },
  { section: "aws", key: "platformSecretAccessKey", label: "AWS secret key" },
  { section: "pulumi", key: "configPassphrase", label: "Pulumi config passphrase" },
];

function PresenceBadge({ value }: { value: Presence | boolean }) {
  const set = value === true || value === "set";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[11px]",
        set
          ? "border-success/40 text-success"
          : "border-muted-foreground/30 text-muted-foreground",
      )}
    >
      {set ? <Check size={11} /> : <X size={11} />}
      {set ? "set" : "unset"}
    </Badge>
  );
}

function ConfigRow({
  label,
  value,
  isPresence = false,
}: {
  label: string;
  value: Presence | boolean | string | null;
  isPresence?: boolean;
}) {
  const renderValue = () => {
    if (isPresence || value === "set" || value === "unset" || typeof value === "boolean") {
      return <PresenceBadge value={value as Presence | boolean} />;
    }
    if (value === null || value === "") {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    return <code className="font-mono text-xs text-foreground">{value}</code>;
  };
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {renderValue()}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

export default function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<SystemConfig>("/api/admin/system-config")
      .then(setConfig)
      .catch((err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to load system config",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const missing = config
    ? REQUIRED_FOR_DEPLOY.filter((r) => {
        const section = config[r.section] as Record<string, unknown>;
        const v = section[r.key];
        return v === "unset" || v === null || v === "";
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title="System config"
        subtitle="Read-only view of the runtime environment. Set values are masked or shown as presence flags."
      />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {!loading && config && (
        <>
          {missing.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2 text-warning-foreground">
                <AlertTriangle size={14} />
                <span className="text-sm font-medium">
                  {missing.length} value{missing.length === 1 ? "" : "s"} required for deploys
                  {missing.length === 1 ? " is" : " are"} unset
                </span>
              </div>
              <ul className="mt-2 ml-6 list-disc text-xs text-muted-foreground">
                {missing.map((m) => (
                  <li key={`${m.section}.${m.key}`}>{m.label}</li>
                ))}
              </ul>
            </div>
          )}

          <Section title="Runtime">
            <ConfigRow label="NODE_ENV" value={config.runtime.nodeEnv} />
            <ConfigRow label="PORT" value={config.runtime.port} />
            <ConfigRow label="CORS_ORIGIN" value={config.runtime.corsOrigin} />
            <ConfigRow label="WEB_ORIGIN" value={config.runtime.webOrigin} />
            <ConfigRow label="AUTH_COOKIE_DOMAIN" value={config.runtime.authCookieDomain} />
          </Section>

          <Section title="Databases">
            <ConfigRow label="DATABASE_URL" value={config.databases.databaseUrl} />
            <ConfigRow label="REDIS_URL" value={config.databases.redisUrl} />
          </Section>

          <Section title="Auth">
            <ConfigRow label="BETTER_AUTH_URL" value={config.auth.betterAuthUrl} />
            <ConfigRow label="BETTER_AUTH_SECRET" value={config.auth.betterAuthSecret} />
            <ConfigRow label="ENCRYPTION_KEY" value={config.auth.encryptionKey} />
          </Section>

          <Section title="GitHub App">
            <ConfigRow label="GITHUB_APP_ID" value={config.github.appId} />
            <ConfigRow label="GITHUB_APP_SLUG" value={config.github.appSlug} />
            <ConfigRow label="GITHUB_APP_CLIENT_ID" value={config.github.appClientId} />
            <ConfigRow label="GITHUB_APP_CLIENT_SECRET" value={config.github.appClientSecret} />
            <ConfigRow label="GITHUB_APP_PRIVATE_KEY" value={config.github.appPrivateKey} />
            <ConfigRow label="GITHUB_WEBHOOK_SECRET" value={config.github.webhookSecret} />
            <ConfigRow label="GITHUB_STATE_SECRET" value={config.github.stateSecret} />
            <ConfigRow
              label="ALLOW_UNSIGNED_GITHUB_WEBHOOKS"
              value={config.github.allowUnsignedWebhooks}
              isPresence
            />
            <ConfigRow
              label="BOOTSTRAP_GITHUB_INSTALLATION_ID"
              value={config.github.bootstrapInstallationId}
            />
          </Section>

          <Section title="AWS (platform)">
            <ConfigRow label="PLATFORM_AWS_ACCOUNT_ID" value={config.aws.platformAccountId} />
            <ConfigRow label="PLATFORM_AWS_ACCESS_KEY_ID" value={config.aws.platformAccessKeyId} />
            <ConfigRow
              label="PLATFORM_AWS_SECRET_ACCESS_KEY"
              value={config.aws.platformSecretAccessKey}
            />
            <ConfigRow
              label="PLATFORM_AWS_SESSION_TOKEN"
              value={config.aws.platformSessionToken}
            />
          </Section>

          <Section title="Pulumi">
            <ConfigRow label="PULUMI_CONFIG_PASSPHRASE" value={config.pulumi.configPassphrase} />
            <ConfigRow label="PULUMI_BASE_DEPS_DIR" value={config.pulumi.baseDepsDir} />
          </Section>

          <Section title="Bootstrap">
            <ConfigRow label="DEFAULT_ORG_NAME" value={config.bootstrap.defaultOrgName} />
            <ConfigRow label="DEFAULT_ORG_SLUG" value={config.bootstrap.defaultOrgSlug} />
            <ConfigRow
              label="BOOTSTRAP_ADMIN_EMAIL"
              value={config.bootstrap.bootstrapAdminEmail}
            />
          </Section>

          <Section title="AI">
            <ConfigRow label="ANTHROPIC_API_KEY" value={config.ai.anthropicApiKey} />
          </Section>
        </>
      )}
    </div>
  );
}

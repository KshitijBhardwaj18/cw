import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../common/guards/auth.guard";
import { SystemRoleGuard, RequireSystemRole } from "../common/rbac";
import type { DisplayKind, Presence, SystemConfig } from "@heizen/shared";

function presence(v: string | undefined): Presence {
  return v && v.trim().length > 0 ? "set" : "unset";
}

function mask(v: string | undefined, prefix = 4): string | null {
  const value = v?.trim();
  if (!value) return null;
  if (value.length <= prefix) return "•".repeat(value.length);
  return `${value.slice(0, prefix)}${"•".repeat(Math.max(0, value.length - prefix))}`;
}

function pick(value: string | undefined, kind: DisplayKind): string | Presence | null {
  const normalized = value?.trim();
  if (kind === "presence") return presence(normalized);
  if (kind === "masked") return mask(normalized);
  return normalized && normalized.length > 0 ? normalized : null;
}

type FieldSpec = readonly [envKey: string, kind: DisplayKind];
type SectionSpec = Record<string, FieldSpec>;

const POLICY = {
  runtime: {
    nodeEnv: ["NODE_ENV", "plain"],
    port: ["PORT", "plain"],
    corsOrigin: ["CORS_ORIGIN", "plain"],
    webOrigin: ["WEB_ORIGIN", "plain"],
    authCookieDomain: ["AUTH_COOKIE_DOMAIN", "plain"],
  },
  databases: {
    databaseUrl: ["DATABASE_URL", "presence"],
    redisUrl: ["REDIS_URL", "presence"],
  },
  auth: {
    betterAuthUrl: ["BETTER_AUTH_URL", "plain"],
    betterAuthSecret: ["BETTER_AUTH_SECRET", "presence"],
    encryptionKey: ["ENCRYPTION_KEY", "presence"],
  },
  github: {
    appId: ["GITHUB_APP_ID", "presence"],
    appSlug: ["GITHUB_APP_SLUG", "plain"],
    appClientId: ["GITHUB_APP_CLIENT_ID", "masked"],
    appClientSecret: ["GITHUB_APP_CLIENT_SECRET", "presence"],
    appPrivateKey: ["GITHUB_APP_PRIVATE_KEY", "presence"],
    webhookSecret: ["GITHUB_WEBHOOK_SECRET", "presence"],
    stateSecret: ["GITHUB_STATE_SECRET", "presence"],
    bootstrapInstallationId: ["BOOTSTRAP_GITHUB_INSTALLATION_ID", "presence"],
  },
  aws: {
    platformAccountId: ["PLATFORM_AWS_ACCOUNT_ID", "masked"],
    platformAccessKeyId: ["PLATFORM_AWS_ACCESS_KEY_ID", "masked"],
    platformSecretAccessKey: ["PLATFORM_AWS_SECRET_ACCESS_KEY", "presence"],
    platformSessionToken: ["PLATFORM_AWS_SESSION_TOKEN", "presence"],
  },
  pulumi: {
    configPassphrase: ["PULUMI_CONFIG_PASSPHRASE", "presence"],
    baseDepsDir: ["PULUMI_BASE_DEPS_DIR", "plain"],
  },
  bootstrap: {
    defaultOrgName: ["DEFAULT_ORG_NAME", "plain"],
    defaultOrgSlug: ["DEFAULT_ORG_SLUG", "plain"],
    bootstrapAdminEmail: ["BOOTSTRAP_ADMIN_EMAIL", "plain"],
  },
  ai: {
    anthropicApiKey: ["ANTHROPIC_API_KEY", "presence"],
  },
} as const satisfies Record<string, SectionSpec>;

function buildSection(spec: SectionSpec): Record<string, string | Presence | null> {
  const out: Record<string, string | Presence | null> = {};
  for (const [outKey, [envKey, kind]] of Object.entries(spec)) {
    out[outKey] = pick(process.env[envKey], kind);
  }
  return out;
}

@Controller("api/admin/system-config")
@UseGuards(AuthGuard, SystemRoleGuard)
@RequireSystemRole("ADMIN")
export class AdminSystemController {
  @Get()
  get(): SystemConfig {
    return {
      runtime: buildSection(POLICY.runtime),
      databases: buildSection(POLICY.databases),
      auth: buildSection(POLICY.auth),
      github: {
        ...buildSection(POLICY.github),
        allowUnsignedWebhooks: process.env.ALLOW_UNSIGNED_GITHUB_WEBHOOKS === "1",
      },
      aws: buildSection(POLICY.aws),
      pulumi: buildSection(POLICY.pulumi),
      bootstrap: buildSection(POLICY.bootstrap),
      ai: buildSection(POLICY.ai),
    } as SystemConfig;
  }
}

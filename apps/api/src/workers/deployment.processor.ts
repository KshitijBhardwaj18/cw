import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@heizen/db";
import { PRISMA } from "../prisma/prisma.module";
import {
  assumeCustomerRole,
  ensureStateBucket,
  buildTemplateContext,
  renderTemplates,
  runPulumiUp,
  runPulumiDestroy,
  exportStack,
  buildLightsailArtifacts,
  getInstallationToken,
  parseComposeYaml,
} from "@heizen/infra-core";
import type {
  HeizenConfig,
  HeizenEnvConfig,
  ParsedCompose,
} from "@heizen/shared";
import { DeploymentsSseService } from "../deployments/deployments-sse.service";
import { EnvVarsService } from "../env-vars/env-vars.service";
import { EventsGateway } from "../websocket/events.gateway";
import { requiredEnv } from "../common/env";

export interface DeploymentJob {
  deploymentId: string;
  environmentId: string;
  projectId: string;
}

function parseImageUri(imageUri: string): { image: string; tag: string } {
  const lastColon = imageUri.lastIndexOf(":");
  const lastSlash = imageUri.lastIndexOf("/");
  if (lastColon > lastSlash) {
    return {
      image: imageUri.slice(0, lastColon),
      tag: imageUri.slice(lastColon + 1),
    };
  }
  return { image: imageUri, tag: "latest" };
}

@Processor("deployment", { concurrency: 1, stalledInterval: 30_000, maxStalledCount: 2 })
export class DeploymentProcessor extends WorkerHost {
  private readonly logger = new Logger(DeploymentProcessor.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sse: DeploymentsSseService,
    private readonly envVars: EnvVarsService,
    private readonly gateway: EventsGateway,
  ) {
    super();
  }

  /**
   * Fetches the user's docker-compose.yml from the configured branch,
   * generates the platform-side artifacts (Caddyfile + Caddy sidecar
   * compose + .env), validates routing, and returns the Pulumi config
   * secrets the Lightsail template expects. Each blob is base64-encoded
   * so it embeds cleanly in cloud-init shell heredocs.
   */
  private async buildLightsailConfigSecrets(args: {
    project: { id: string; githubInstallationId: string | null; githubOwner: string | null; githubRepo: string | null; githubBranch: string | null };
    updatedConfig: HeizenConfig;
    envCfg: HeizenEnvConfig;
    environment: { id: string };
    deploymentId: string;
    imageUri: string;
    awsCreds: { accessKeyId: string; secretAccessKey: string; sessionToken: string; region: string };
  }): Promise<Record<string, string>> {
    const { project, updatedConfig, envCfg, deploymentId, imageUri, awsCreds } = args;

    if (!project.githubInstallationId || !project.githubOwner || !project.githubRepo) {
      throw new Error(
        "Lightsail (staging) deploys require a GitHub repo connection. Connect a repo to this project before deploying.",
      );
    }
    const branch = project.githubBranch ?? "main";

    await this.sse.logAndEmit(
      deploymentId,
      "SYSTEM",
      "info",
      `Fetching docker-compose.yml from ${project.githubOwner}/${project.githubRepo}@${branch}...`,
    );

    const composeYaml = await this.fetchComposeFromGithub(
      project.githubInstallationId,
      project.githubOwner,
      project.githubRepo,
      branch,
    );

    const parsedCompose: ParsedCompose = {
      filePath: "docker-compose.yml",
      raw: composeYaml,
      services: parseComposeYaml(composeYaml),
    };

    // Flatten the per-service env map to a single key->value map for
    // the .env file. Conflicts resolve in favor of the last-written
    // value; users put shared values in the "shared" service block to
    // disambiguate.
    const envVars: Record<string, string> = {};
    for (const [, vars] of Object.entries(envCfg.env)) {
      for (const [key, value] of Object.entries(vars)) {
        envVars[key] = value;
      }
    }

    const caddyEmail =
      updatedConfig.caddyEmail ??
      process.env.BOOTSTRAP_ADMIN_EMAIL ??
      "admin@heizen.tech";

    const artifacts = buildLightsailArtifacts({
      cfg: updatedConfig,
      composeYaml,
      parsedCompose,
      envVars,
      caddyEmail,
    });

    // ECR registry from the image URI. Only set if it looks like an
    // ECR registry; Docker Hub and other public registries can be
    // pulled without docker login.
    const ecrMatch = /^(\d+\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com)\//.exec(
      imageUri,
    );
    const ecrRegistry = ecrMatch?.[1] ?? "";

    const toB64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

    // user_data on Lightsail is capped at 16 KiB. Refuse early if the
    // combined blobs are too big — that's a real failure mode in repos
    // with massive compose files or env blocks.
    const totalSize =
      artifacts.composeYaml.length +
      artifacts.caddyfile.length +
      artifacts.envFile.length +
      artifacts.caddyComposeYaml.length;
    if (totalSize > 12_000) {
      throw new Error(
        `Combined compose + Caddyfile + .env + caddy-compose is ${totalSize} bytes ` +
          `which after base64 + cloud-init wrapping exceeds Lightsail's 16 KB user_data ` +
          `limit. Reduce env vars or split services.`,
      );
    }

    return {
      composeB64: toB64(artifacts.composeYaml),
      caddyfileB64: toB64(artifacts.caddyfile),
      envFileB64: toB64(artifacts.envFile),
      caddyDockerComposeB64: toB64(artifacts.caddyComposeYaml),
      ecrRegistry,
      // STS creds — only used if ecrRegistry is set. Lightsail VM does
      // docker login on first boot then discards them.
      ecrAccessKey: ecrRegistry ? awsCreds.accessKeyId : "",
      ecrSecretKey: ecrRegistry ? awsCreds.secretAccessKey : "",
      ecrSessionToken: ecrRegistry ? awsCreds.sessionToken : "",
    };
  }

  /**
   * Pulls a file from a GitHub repo via the contents API using the
   * GitHub App installation token. Branch is required so we always
   * deploy what's actually at HEAD of the configured branch, not what
   * the indexer cached at some earlier time.
   */
  private async fetchComposeFromGithub(
    installationId: string,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<string> {
    const token = await getInstallationToken(installationId);
    const candidates = [
      "docker-compose.yml",
      "docker-compose.yaml",
      "compose.yml",
      "compose.yaml",
    ];
    for (const file of candidates) {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${encodeURIComponent(branch)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw",
        },
      });
      if (res.status === 404) continue;
      if (!res.ok) {
        throw new Error(
          `GitHub returned ${res.status} fetching ${file} from ${owner}/${repo}@${branch}.`,
        );
      }
      return await res.text();
    }
    throw new Error(
      `No docker-compose.yml found at the root of ${owner}/${repo}@${branch}. The Lightsail template requires one — add a compose file at the repo root.`,
    );
  }

  async process(job: Job<DeploymentJob>): Promise<void> {
    return Promise.race([
      this.doProcess(job),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Deployment timed out after 30 minutes")),
          30 * 60 * 1000,
        ),
      ),
    ]);
  }

  private async doProcess(job: Job<DeploymentJob>): Promise<void> {
    const { deploymentId, environmentId, projectId } = job.data;
    const outputDir = path.join(os.tmpdir(), `infra-${deploymentId}`);

    let orgId = "";

    try {
      const [deployment, environment, project] = await Promise.all([
        this.prisma.deployment.findUnique({ where: { id: deploymentId } }),
        this.prisma.environment.findUnique({ where: { id: environmentId } }),
        this.prisma.project.findUnique({ where: { id: projectId } }),
      ]);

      if (!deployment || !environment || !project) {
        throw new Error("Deployment, environment, or project not found");
      }

      if (deployment.status === "CANCELLED") {
        this.logger.log(`Deployment ${deploymentId} was cancelled before processing started — skipping`);
        return;
      }

      orgId = project.organizationId;
      const heizenConfig = environment.heizenConfig as HeizenConfig | null;
      if (!heizenConfig) throw new Error("heizenConfig not set");
      if (!environment.awsRoleArn || !environment.region) {
        throw new Error("AWS configuration missing");
      }

      const imageUri = environment.imageUri;
      if (!imageUri) {
        throw new Error(
          "Docker image URI not configured. Set it in the deploy form.",
        );
      }

      const envType = environment.type === "PRODUCTION" ? "production" : "staging";
      const prefix = `${project.slug}-${envType}`;
      const stateBucket = `heizen-${project.slug}-${envType}-state`;
      const passphrase = requiredEnv("PULUMI_CONFIG_PASSPHRASE");

      await this.sse.logAndEmit(deploymentId, "SYSTEM", "info", "Assuming AWS role...");
      const awsCreds = await assumeCustomerRole(
        environment.awsRoleArn,
        environmentId,
        environment.region,
      );

      await this.sse.logAndEmit(
        deploymentId,
        "SYSTEM",
        "info",
        "Ensuring Pulumi state bucket...",
      );

      const s3 = new S3Client({
        region: environment.region,
        credentials: awsCreds,
      });
      await ensureStateBucket(s3, stateBucket, environment.region);

      await this.prisma.environment.update({
        where: { id: environmentId },
        data: {
          pulumiBackendBucket: stateBucket,
          pulumiStackName: environment.pulumiStackName ?? prefix,
        },
      });

      environment.pulumiBackendBucket = stateBucket;
      environment.pulumiStackName = environment.pulumiStackName ?? prefix;

      await this.prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: "DEPLOYING",
          imageUri,
          startedAt: new Date(),
        },
      });
      this.gateway.emitDeploymentStatus(orgId, { deploymentId, status: "DEPLOYING" });

      const { image, tag } = parseImageUri(imageUri);

      const envCfg: HeizenEnvConfig = {
        env: await this.envVars.getDecryptedForDeployment(environmentId),
      };
      const updatedConfig: HeizenConfig = {
        ...heizenConfig,
        env: envType,
        ecr: { image, tag },
      };
      const ctx = buildTemplateContext(updatedConfig, envCfg);
      await renderTemplates(ctx, envType, outputDir);

      // Diagnostic: surface whether node_modules actually has @pulumi/pulumi
      // after renderTemplates returns. Catches the silent "symlink to
      // nowhere" failure mode that prints "Pulumi SDK has not been
      // installed" from Pulumi's vague top-level error handler.
      try {
        const nm = path.join(outputDir, "node_modules", "@pulumi", "pulumi");
        const stat = await fs.stat(nm);
        await this.sse.logAndEmit(
          deploymentId,
          "SYSTEM",
          "info",
          `Pulumi deps OK: ${nm} (${stat.isDirectory() ? "dir" : "not dir"})`,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await this.sse.logAndEmit(
          deploymentId,
          "SYSTEM",
          "error",
          `Pulumi deps MISSING after renderTemplates: ${msg}. PULUMI_BASE_DEPS_DIR=${process.env.PULUMI_BASE_DEPS_DIR ?? "<unset>"}`,
        );
      }

      // Build Pulumi config secrets — the shape differs per template.
      //
      // ECS template: every env var becomes its own Pulumi config secret,
      // referenced as cfg.requireSecret("camelCaseKey") in the rendered
      // index.ts.
      //
      // Lightsail template: the user's compose, our Caddyfile, the env
      // file, and (optionally) ECR creds — all base64-encoded — go in
      // as a fixed set of 4 + 4 keys. The instance's cloud-init decodes
      // and writes them at boot.
      let configSecrets: Record<string, string>;
      if (envType === "staging") {
        configSecrets = await this.buildLightsailConfigSecrets({
          project,
          updatedConfig,
          envCfg,
          environment,
          deploymentId,
          imageUri,
          awsCreds,
        });
      } else {
        configSecrets = {};
        for (const [, vars] of Object.entries(envCfg.env)) {
          for (const [key, value] of Object.entries(vars)) {
            const camelKey = key
              .toLowerCase()
              .replace(/[-_](.)/g, (_, c: string) => (c as string).toUpperCase());
            configSecrets[camelKey] = value;
          }
        }
      }

      const stackName = environment.pulumiStackName ?? prefix;
      const isDestroy = deployment.kind === "DESTROY";

      if (isDestroy) {
        await this.sse.logAndEmit(
          deploymentId,
          "SYSTEM",
          "info",
          "Running pulumi destroy...",
        );

        await runPulumiDestroy({
          workDir: outputDir,
          stackName,
          backendBucket: environment.pulumiBackendBucket!,
          passphrase,
          awsCreds,
          configSecrets,
          removeStack: true,
          onOutput: (line) => {
            void this.sse.logAndEmit(deploymentId, "PULUMI", "info", line);
          },
        });

        // Tombstone the env: clear stack metadata + cached resources so
        // a future deploy starts from scratch (new bucket layout, new
        // stack name on first up). Keep heizenConfig / awsRoleArn so
        // the user doesn't lose their wiring.
        await this.prisma.stackResource.deleteMany({ where: { environmentId } });

        await this.prisma.deployment.update({
          where: { id: deploymentId },
          data: {
            status: "SUCCESS",
            completedAt: new Date(),
            stackOutputs: {} as object,
          },
        });

        await this.prisma.environment.update({
          where: { id: environmentId },
          data: {
            status: "DESTROYED",
            stackOutputs: {} as object,
            pulumiBackendBucket: null,
            pulumiStackName: null,
            lastDeployedAt: null,
          },
        });

        this.gateway.emitDeploymentStatus(orgId, { deploymentId, status: "SUCCESS" });
        this.gateway.emitEnvironmentStatus(orgId, { environmentId, status: "DESTROYED" });

        await this.sse.logAndEmit(
          deploymentId,
          "SYSTEM",
          "info",
          "Destroy completed successfully. All AWS resources removed.",
        );
        return;
      }

      // ── DEPLOY path ────────────────────────────────────────────────
      const upResult = await runPulumiUp({
        workDir: outputDir,
        stackName,
        backendBucket: environment.pulumiBackendBucket!,
        passphrase,
        awsCreds,
        configSecrets,
        needsDbPassword: updatedConfig.database.engine === "postgres",
        onOutput: (line) => {
          void this.sse.logAndEmit(deploymentId, "PULUMI", "info", line);
        },
      });

      const exported = await exportStack(
        outputDir,
        stackName,
        environment.pulumiBackendBucket!,
        passphrase,
        awsCreds,
      );

      await this.prisma.stackResource.deleteMany({ where: { environmentId } });
      for (const resource of exported.resources) {
        if (!resource.urn || resource.type === "pulumi:pulumi:Stack") continue;
        await this.prisma.stackResource.create({
          data: {
            environmentId,
            pulumiUrn: resource.urn,
            type: resource.type,
            name: (resource as { name?: string }).name ?? resource.type,
            properties: resource as object,
            dependencies: resource.dependencies ?? [],
          },
        });
      }

      const rawOutputs = upResult.outputs as Record<
        string,
        { value: unknown; secret: boolean }
      >;
      const stackOutputs: Record<string, unknown> = {};
      for (const [key, output] of Object.entries(rawOutputs)) {
        stackOutputs[key] =
          output !== null &&
          typeof output === "object" &&
          "value" in output
            ? output.value
            : output;
      }

      await this.prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: "SUCCESS",
          stackOutputs: stackOutputs as object,
          completedAt: new Date(),
        },
      });

      await this.prisma.environment.update({
        where: { id: environmentId },
        data: {
          status: "LIVE",
          lastDeployedAt: new Date(),
          stackOutputs: stackOutputs as object,
        },
      });

      this.gateway.emitDeploymentStatus(orgId, { deploymentId, status: "SUCCESS" });
      this.gateway.emitEnvironmentStatus(orgId, { environmentId, status: "LIVE" });

      await this.sse.logAndEmit(
        deploymentId,
        "SYSTEM",
        "info",
        "Deployment completed successfully.",
      );
    } catch (error) {
      this.logger.error(`Deployment ${deploymentId} failed`, error);
      const message =
        error instanceof Error ? error.message : String(error);

      await this.prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: "FAILED", errorMessage: message, completedAt: new Date() },
      });
      await this.prisma.environment.update({
        where: { id: environmentId },
        data: { status: "FAILED" },
      });

      if (orgId) {
        this.gateway.emitDeploymentStatus(orgId, { deploymentId, status: "FAILED" });
        this.gateway.emitEnvironmentStatus(orgId, { environmentId, status: "FAILED" });
      }

      await this.sse.logAndEmit(deploymentId, "SYSTEM", "error", message);
      throw error;
    } finally {
      await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
      this.sse.cleanup(deploymentId);
    }
  }
}

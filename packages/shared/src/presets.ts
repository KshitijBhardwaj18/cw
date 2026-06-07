import type {
  CacheSize,
  DbSize,
  LightsailBundle,
  NatMode,
} from "./heizen-config";

export interface DbPreset {
  instanceClass: string;
  label: string;
  monthlyCost: number;
  /** Initial allocated EBS storage (gp3) in GB. Sized to roughly match
   *  instance RAM so we don't undersize storage on bigger boxes. */
  allocatedStorageGb: number;
}

export interface CachePreset {
  nodeType: string;
  label: string;
  monthlyCost: number;
}

export const DB_PRESETS: Record<DbSize, DbPreset> = {
  micro: { instanceClass: "db.t4g.micro", label: "2 vCPU / 1 GB", monthlyCost: 15, allocatedStorageGb: 20 },
  small: { instanceClass: "db.t4g.small", label: "2 vCPU / 2 GB", monthlyCost: 30, allocatedStorageGb: 50 },
  medium: { instanceClass: "db.t4g.medium", label: "2 vCPU / 4 GB", monthlyCost: 60, allocatedStorageGb: 100 },
  large: { instanceClass: "db.t4g.large", label: "2 vCPU / 8 GB", monthlyCost: 120, allocatedStorageGb: 200 },
};

export const CACHE_PRESETS: Record<CacheSize, CachePreset> = {
  micro: { nodeType: "cache.t4g.micro", label: "0.5 GB", monthlyCost: 13 },
  small: { nodeType: "cache.t4g.small", label: "1.5 GB", monthlyCost: 26 },
  medium: { nodeType: "cache.t4g.medium", label: "3 GB", monthlyCost: 48 },
};

export const NAT_COSTS: Record<NatMode, number> = {
  none: 0,
  single: 35,
  dual: 70,
};

export const ALB_MONTHLY_COST = 18;
export const STORAGE_MONTHLY_COST = 3;

// ── Lightsail bundles ────────────────────────────────────────────────────
// Bundle IDs are stable across Lightsail regions. Data transfer GB
// included in the bundle; only relevant for cost calc, not Pulumi.
export interface LightsailBundlePreset {
  bundleId: string;
  label: string;
  ramGb: number;
  vcpus: number;
  storageGb: number;
  transferTb: number;
  monthlyCost: number;
}

export const LIGHTSAIL_BUNDLE_PRESETS: Record<
  LightsailBundle,
  LightsailBundlePreset
> = {
  nano:   { bundleId: "nano_3_0",   label: "512 MB / 2 vCPU / 20 GB",  ramGb: 0.5, vcpus: 2, storageGb: 20,  transferTb: 1, monthlyCost: 5 },
  micro:  { bundleId: "micro_3_0",  label: "1 GB / 2 vCPU / 40 GB",    ramGb: 1,   vcpus: 2, storageGb: 40,  transferTb: 2, monthlyCost: 7 },
  small:  { bundleId: "small_3_0",  label: "2 GB / 2 vCPU / 60 GB",    ramGb: 2,   vcpus: 2, storageGb: 60,  transferTb: 3, monthlyCost: 12 },
  medium: { bundleId: "medium_3_0", label: "4 GB / 2 vCPU / 80 GB",    ramGb: 4,   vcpus: 2, storageGb: 80,  transferTb: 4, monthlyCost: 24 },
  large:  { bundleId: "large_3_0",  label: "8 GB / 2 vCPU / 160 GB",   ramGb: 8,   vcpus: 2, storageGb: 160, transferTb: 5, monthlyCost: 48 },
};

// AWS Lightsail availability — manually curated since the SDK doesn't
// expose a discover endpoint. Re-verify if AWS launches new regions.
export const LIGHTSAIL_REGIONS = [
  "us-east-1", "us-east-2", "us-west-2",
  "ap-south-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2",
  "ca-central-1", "eu-central-1", "eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3",
] as const;

export type LightsailRegion = (typeof LIGHTSAIL_REGIONS)[number];

export function isLightsailRegion(region: string): region is LightsailRegion {
  return (LIGHTSAIL_REGIONS as readonly string[]).includes(region);
}

/** Rough monthly Fargate cost estimate from CPU units and memory MB. */
export function estimateFargateMonthlyCost(cpu: number, memory: number): number {
  const vcpu = cpu / 1024;
  const gb = memory / 1024;
  return Math.round(vcpu * 30 + gb * 3);
}

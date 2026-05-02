import type { PrismaQuery } from "@casl/prisma";
import type { AppSubjects } from "../types/subjects";

export const TALENT_COMMUNITY_ROUTE: AppSubjects = "TalentCommunity";

export const TALENT_COMMUNITY_TABS = [
	"all",
	"new-unassigned",
	"invited",
] as const;

export type TalentCommunityTab = (typeof TALENT_COMMUNITY_TABS)[number];

export const TALENT_COMMUNITY_TAB_CONDITIONS = {
	all: { tab: "all" },
	"new-unassigned": { tab: "new-unassigned" },
	invited: { tab: "invited" },
} as const satisfies Record<TalentCommunityTab, PrismaQuery>;

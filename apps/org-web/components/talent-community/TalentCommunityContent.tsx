"use client";

import {
	Action,
	filterReadableTabs,
	TALENT_COMMUNITY_TAB_CONDITIONS,
	type TabAbilityCheck,
	useAbility,
} from "@repo/casl";
import type { CandidateTalentType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { ChevronDown, Plus, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import { useOrgContext } from "@/contexts/org-context";
import { useTalentCommunityColumns } from "@/hooks/tables/use-talent-community-columns";
import { useTalentCommunityFilters } from "@/hooks/use-talent-community-filters";
import { useTalentCommunity } from "@/queries/talent-community.queries";
import type { TalentCommunityTab } from "@/services/talent-community.service";
import { AddExistingTalentDialog } from "./AddExistingTalentDialog";
import { CandidateProfileSheet } from "./candidate-profile";
import { InviteCandidateDialog } from "./InviteCandidateDialog";
import { TalentCommunityPageLoading } from "./TalentCommunityPageLoading";

const TAB_LABELS: Record<TalentCommunityTab, string> = {
	"talent-community": "Talent Community",
	new: "New / Unassigned Talent",
	invited: "Invited Candidates",
};

const TAB_ORDER: readonly TalentCommunityTab[] = [
	"talent-community",
	"new",
	"invited",
] as const;

const TAB_CHECKS: Record<TalentCommunityTab, TabAbilityCheck> = {
	"talent-community": {
		subject: "TalentCommunity",
		conditions: TALENT_COMMUNITY_TAB_CONDITIONS.all,
	},
	new: {
		subject: "TalentCommunity",
		conditions: TALENT_COMMUNITY_TAB_CONDITIONS["new-unassigned"],
	},
	invited: {
		subject: "TalentCommunity",
		conditions: TALENT_COMMUNITY_TAB_CONDITIONS.invited,
	},
};

export function TalentCommunityContent() {
	const { id: orgId } = useOrgContext();
	const ability = useAbility();

	const allowedTabs = useMemo(
		() => filterReadableTabs(ability, TAB_ORDER, TAB_CHECKS),
		[ability],
	);

	const canManageTalent = ability.can(Action.Create, "TalentCommunity");

	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();

	const tabFromUrl = searchParams.get("tcTab") as TalentCommunityTab | null;
	const urlTabIsAllowed =
		tabFromUrl && allowedTabs.includes(tabFromUrl) ? tabFromUrl : null;

	const [activeTab, setActiveTab] = useState<TalentCommunityTab>(
		() => allowedTabs[0] ?? "talent-community",
	);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [addExistingDialogOpen, setAddExistingDialogOpen] = useState(false);
	const [profileCandidate, setProfileCandidate] =
		useState<CandidateTalentType | null>(null);

	const handleViewProfile = useCallback((candidate: CandidateTalentType) => {
		setProfileCandidate(candidate);
	}, []);

	useEffect(() => {
		if (allowedTabs.length === 0) {
			return;
		}
		if (urlTabIsAllowed) {
			setActiveTab(urlTabIsAllowed);
		} else {
			setActiveTab(allowedTabs[0] ?? "talent-community");
		}
	}, [allowedTabs, urlTabIsAllowed]);

	const {
		search,
		debouncedSearch,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		pageSize,
		workforceTypeFilter,
		statusFilter,
		query,
		filterConfigs,
	} = useTalentCommunityFilters();

	const { data, isLoading, isError } = useTalentCommunity(orgId, {
		tab: activeTab,
		...query,
	});

	const counts = data?.counts ?? {
		talentCommunity: 0,
		newUnassigned: 0,
		invited: 0,
	};

	const tabCounts: Record<TalentCommunityTab, number> = {
		"talent-community": counts.talentCommunity,
		new: counts.newUnassigned,
		invited: counts.invited,
	};

	const handleTabChange = (tab: TalentCommunityTab) => {
		if (!allowedTabs.includes(tab)) {
			return;
		}
		setActiveTab(tab);
		pushParams({
			tcTab: tab,
			page: null,
			search: null,
			tcWfType: null,
			tcInvite: null,
		});
	};

	const columns = useTalentCommunityColumns(activeTab, handleViewProfile);

	const hasActiveFilters = Boolean(
		debouncedSearch.trim() ||
			workforceTypeFilter !== "all" ||
			statusFilter !== "all",
	);

	const total = data?.total ?? 0;

	if (allowedTabs.length === 0) {
		return (
			<AccessBlockedState
				title="No access to Talent Community"
				description="You don't have permission to view any Talent Community tab. Contact your administrator if you believe this is a mistake."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Talent Community"
				total={total}
				itemLabel="candidate"
				itemLabelPlural="candidates"
				description={
					hasActiveFilters
						? undefined
						: "Manage all candidates and talent across your organization."
				}
				countText={
					hasActiveFilters
						? `${total} candidate${total !== 1 ? "s" : ""} match${total === 1 ? "es" : ""}`
						: undefined
				}
				rightContent={
					canManageTalent ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="w-full shrink-0 sm:w-auto">
									<Plus className="size-4" />
									Add Candidate
									<ChevronDown className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem
									className="cursor-pointer gap-2 py-2.5"
									onSelect={() => setAddExistingDialogOpen(true)}
								>
									<Users className="text-muted-foreground size-4 shrink-0" />
									<div>
										<p className="font-medium text-sm">Add Existing Talent</p>
										<p className="text-muted-foreground text-xs">
											From past applicants or workers
										</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer gap-2 py-2.5"
									onSelect={() => setInviteDialogOpen(true)}
								>
									<Plus className="text-muted-foreground size-4 shrink-0" />
									<div>
										<p className="font-medium text-sm">Invite New Candidate</p>
										<p className="text-muted-foreground text-xs">
											Quick add with minimal info
										</p>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : undefined
				}
			/>

			<Tabs
				value={activeTab}
				onValueChange={(v) => handleTabChange(v as TalentCommunityTab)}
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{allowedTabs.map((tab) => (
							<TabsTrigger
								key={tab}
								value={tab}
								className="flex flex-none items-center gap-2 rounded-none border-0 px-4 py-3"
							>
								{TAB_LABELS[tab]}
								<span
									className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
										activeTab === tab
											? "bg-primary/10 text-primary"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{isLoading ? "—" : tabCounts[tab]}
								</span>
							</TabsTrigger>
						))}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			<SearchWithFilters
				searchPlaceholder="Search by name or occupation..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isLoading ? (
				<TalentCommunityPageLoading />
			) : isError ? (
				<ConfigPageErrorState
					title="Could not load talent community"
					description="Please try again or contact support if the problem persists."
				/>
			) : (
				<CustomTable
					data={data?.data ?? []}
					columns={columns}
					enablePagination
					paginationMode="server"
					totalCount={data?.total ?? 0}
					currentPage={page}
					pageSize={pageSize}
					onPaginationChange={(newPage) => setPage(newPage)}
					emptyState={
						<ConfigPageEmptyState
							hasSearch={false}
							emptyTitle={
								activeTab === "invited"
									? "No invited candidates yet"
									: activeTab === "new"
										? "No new / unassigned talent"
										: "No talent community members yet"
							}
							emptyMessage={
								activeTab === "invited"
									? "Use the Add Candidate button to invite someone."
									: "Talent will appear here once added."
							}
							icon={Users}
						/>
					}
				/>
			)}

			<AddExistingTalentDialog
				open={addExistingDialogOpen}
				onOpenChange={setAddExistingDialogOpen}
				orgId={orgId}
			/>

			<InviteCandidateDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
				orgId={orgId}
			/>

			<CandidateProfileSheet
				orgId={orgId}
				candidate={profileCandidate}
				open={profileCandidate !== null}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						setProfileCandidate(null);
					}
				}}
			/>
		</div>
	);
}

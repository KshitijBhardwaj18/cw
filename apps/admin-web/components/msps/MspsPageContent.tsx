"use client";

import { Action } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { useMsps } from "@/queries/msps.query";
import { MspCard } from "./MspCard";
import { MspFormDialog } from "./MspFormDialog";
import { MspsTableWrapper } from "./MspsTableWrapper";

const PAGE_SIZE = 8;

export function MspsPageContent() {
	const [createOpen, setCreateOpen] = useState(false);
	const router = useRouter();
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const { data: response } = useMsps(
		page,
		PAGE_SIZE,
		hasActiveSearch ? searchFromUrl : undefined,
	);
	const msps = response.data;
	const total = response.total;
	const totalPages = response.totalPages;
	const { ability } = useAuth();
	const canCreateMsp = ability.can(Action.Create, "MSP");

	return (
		<div className="space-y-6">
			<Tabs defaultValue="card" className="flex flex-col gap-4">
				<ConfigPageHeader
					title="MSPs"
					total={total}
					itemLabel="MSP"
					itemLabelPlural="MSPs"
					countText={
						hasActiveSearch
							? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
							: `${total} ${total === 1 ? "MSP" : "MSPs"}`
					}
					actions={[]}
					rightContent={
						<div className="flex items-center gap-3">
							<ScrollableLineTabsRow underline={false}>
								<TabsList className="inline-flex h-8 w-max min-w-full shrink-0 flex-nowrap">
									<TabsTrigger value="card" className="shrink-0 px-2">
										<LayoutGrid className="size-4" />
										Card
									</TabsTrigger>
									<TabsTrigger value="list" className="shrink-0 px-2">
										<List className="size-4" />
										List
									</TabsTrigger>
								</TabsList>
							</ScrollableLineTabsRow>
							{canCreateMsp && (
								<Button
									className="font-semibold"
									onClick={() => setCreateOpen(true)}
								>
									<Plus data-icon="inline-start" />
									Add MSP
								</Button>
							)}
						</div>
					}
					search={{
						value: localSearch,
						onChange: handleSearchChange,
						placeholder: "Search MSPs...",
					}}
				/>

				{total === 0 ? (
					<ConfigPageEmptyState
						hasSearch={hasActiveSearch}
						emptyTitle="No MSPs yet"
						emptyMessage="Create one to get started."
						searchEmptyMessage="There are no MSPs that match your search."
					/>
				) : (
					<>
						<TabsContent value="card" className="mt-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{msps.map((msp) => (
									<MspCard key={msp.id} msp={msp} />
								))}
							</div>
						</TabsContent>

						<TabsContent value="list" className="mt-4">
							<MspsTableWrapper data={msps} />
						</TabsContent>

						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
						/>
					</>
				)}
			</Tabs>

			<MspFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}

"use client";

import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import UserAvatar from "@repo/ui/general/UserAvatar";
import {
	LIST_FILTER_KEYS,
	useListFilters,
} from "@repo/ui/hooks/use-list-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { ArrowLeft, Building2, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { NoteForm } from "@/components/notes/NoteForm";
import { NotesList } from "@/components/notes/NotesList";
import { MSP_ORGANIZATION_TYPE_OPTIONS } from "@/constants/msp";
import {
	useAddMspDocumentMutation,
	useAddMspNoteMutation,
	useMsp,
	useMspDocumentsQuery,
	useMspNotesQuery,
} from "@/queries/msps.query";
import { MspFormDialog } from "./MspFormDialog";
import { MspProfileTab } from "./MspProfileTab";

type MspDetailsPageContentProps = {
	mspId: string;
};

export function MspDetailsPageContent({ mspId }: MspDetailsPageContentProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [activeTab, setActiveTab] = useTabSwitch(
		["profile", "documents", "notes"],
		{ alsoClearParamKeys: LIST_FILTER_KEYS },
	);
	const documentsFilters = useListFilters();
	const notesFilters = useListFilters();

	const { data: msp } = useMsp(mspId);
	const addDocumentMutation = useAddMspDocumentMutation();
	const addNoteMutation = useAddMspNoteMutation();
	const { data: documents = [], isFetching: documentsLoading } =
		useMspDocumentsQuery(mspId, documentsFilters.filters.search);
	const { data: notes = [], isFetching: notesLoading } = useMspNotesQuery(
		mspId,
		notesFilters.filters.search,
	);

	const handleDocumentSubmit = (
		payload: {
			name: string;
			type: string;
			url: string;
			description?: string;
		},
		file?: File,
	) => {
		if (!file) {
			toast.error("Upload attachment is required");
			return;
		}
		addDocumentMutation.mutate(
			{
				mspId,
				payload: {
					name: payload.name,
					type: payload.type,
					description: payload.description,
				},
				file,
			},
			{
				onSuccess: () => toast.success("Document saved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save Document",
					),
			},
		);
	};

	const handleNoteSubmit = (payload: { type: string; notes: string }) => {
		addNoteMutation.mutate(
			{ mspId, payload },
			{
				onSuccess: () => toast.success("Note saved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save note",
					),
			},
		);
	};

	if (!msp) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<Building2 />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>MSP not found</EmptyTitle>
					<EmptyDescription>
						The MSP you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href="/msps">Back to MSPs</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const orgTypeLabel = getLabel(
		MSP_ORGANIZATION_TYPE_OPTIONS,
		msp.organizationType,
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-4">
					<Button variant="ghost" size="icon" asChild aria-label="Back to MSPs">
						<Link href="/msps">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4">
						<UserAvatar
							avatarUrl={msp.logo ?? ""}
							name={msp.name}
							className="size-16 rounded-xl"
							fallbackClassName="rounded-xl"
						/>
						<div>
							<h1 className="text-2xl font-bold">{msp.name}</h1>
							<p className="text-muted-foreground text-sm">{orgTypeLabel}</p>
						</div>
					</div>
				</div>
				<Button onClick={() => setEditOpen(true)}>
					<Pencil className="size-4" data-icon="inline-start" />
					Edit
				</Button>
			</div>

			<Tabs
				defaultValue={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4 flex-col"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger className="flex-none py-3 px-4" value="profile">
							Profile
						</TabsTrigger>
						<TabsTrigger className="flex-none py-3 px-4" value="documents">
							Documents
						</TabsTrigger>
						<TabsTrigger className="flex-none py-3 px-4" value="notes">
							Notes
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>
				<TabsContent value="profile">
					<MspProfileTab msp={msp} />
				</TabsContent>
				<TabsContent value="documents">
					<div className="space-y-6">
						<DocumentForm
							onSubmit={handleDocumentSubmit}
							isPending={addDocumentMutation.isPending}
						/>
						<DocumentsList
							documents={documents}
							search={documentsFilters.search}
							onSearchChange={documentsFilters.setSearch}
							isLoading={documentsLoading}
						/>
					</div>
				</TabsContent>
				<TabsContent value="notes">
					<div className="space-y-6">
						<NoteForm
							onSubmit={handleNoteSubmit}
							isPending={addNoteMutation.isPending}
						/>
						<NotesList
							notes={notes}
							search={notesFilters.search}
							onSearchChange={notesFilters.setSearch}
							isLoading={notesLoading}
						/>
					</div>
				</TabsContent>
			</Tabs>

			<MspFormDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				initialMsp={msp}
			/>
		</div>
	);
}

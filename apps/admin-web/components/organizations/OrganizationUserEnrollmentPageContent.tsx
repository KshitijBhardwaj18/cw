"use client";

import { OrganizationTimezone } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { BulkJobAlert } from "@repo/ui/general/BulkJobAlert";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchBar } from "@repo/ui/general/SearchBar";
import {
	Briefcase,
	Building2,
	ShoppingBag,
	Upload,
	UserPlus,
	Users,
} from "lucide-react";
import { BulkEnrollmentOrganizationUsersDialog } from "@/components/organizations/BulkEnrollmentOrganizationUsersDialog";
import { CandidatesTabContent } from "@/components/organizations/CandidatesTabContent";
import { EnrollOrganizationUserDialog } from "@/components/organizations/EnrollOrganizationUserDialog";
import { EnrollProgramUserDialog } from "@/components/organizations/EnrollProgramUserDialog";
import { EnrollVendorUserDialog } from "@/components/organizations/EnrollVendorUserDialog";
import { OrganizationUsersTabContent } from "@/components/organizations/OrganizationUsersTabContent";
import { ProgramUsersTabContent } from "@/components/organizations/ProgramUsersTabContent";
import { RemoveMemberConfirmDialog } from "@/components/organizations/RemoveMemberConfirmDialog";
import { SendOrganizationInvitationDialog } from "@/components/organizations/SendOrganizationInvitationDialog";
import { VendorUsersTabContent } from "@/components/organizations/VendorUsersTabContent";
import {
	OrganizationUserEnrollmentProvider,
	useOrganizationUserEnrollment,
} from "@/contexts/organization-user-enrollment.context";
import { toBulkEnrollmentAlertStatus } from "@/utils/bulk-job-banner";

type OrganizationUserEnrollmentPageContentProps = {
	organizationId: string;
};

function OrganizationUserEnrollmentContent() {
	const {
		org,
		search,
		setSearch,
		activeTab,
		handleTabChange,
		orgResult,
		programResult,
		vendorResult,
		candidateResult,
		candidateToToggle,
		setCandidateToToggle,
		candidateToDelete,
		setCandidateToDelete,
		handleConfirmToggleActive,
		handleConfirmDeleteCandidate,
		setActiveMutation,
		deleteCandidateMutation,
		isEnrollDialogOpen,
		setIsEnrollDialogOpen,
		isEnrollProgramDialogOpen,
		setIsEnrollProgramDialogOpen,
		isEnrollVendorDialogOpen,
		setIsEnrollVendorDialogOpen,
		isBulkEnrollmentDialogOpen,
		setIsBulkEnrollmentDialogOpen,
		memberToRemove,
		setMemberToRemove,
		handleRemoveConfirm,
		removeMemberMutation,
		bulkEnrollmentStatus,
		handleBulkJobStarted,
		handleDismissBulkStatus,
		inviteRecipients,
		isInviteDialogOpen,
		handleInviteDialogOpenChange,
	} = useOrganizationUserEnrollment();

	if (!org) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold">
					{activeTab === "organization" && "Organization User Enrollment"}
					{activeTab === "program" && "Program User Enrollment"}
					{activeTab === "vendor" && "Vendor User Enrollment"}
					{activeTab === "candidate" && "Candidates"}
				</h1>
				<p className="text-muted-foreground text-sm">
					{activeTab === "organization" &&
						"Grant existing users organization-specific access and roles"}
					{activeTab === "program" &&
						"Grant program users access to this organization and assign organization-specific roles"}
					{activeTab === "vendor" &&
						"Grant vendor users access to this organization and assign vendor-specific roles"}
					{activeTab === "candidate" &&
						"View, deactivate, or remove candidates onboarded into this organization"}
				</p>
			</div>

			{/* Search */}
			<SearchBar
				value={search}
				onChange={setSearch}
				placeholder="Search enrolled users..."
			/>

			<BulkJobAlert
				status={toBulkEnrollmentAlertStatus(bulkEnrollmentStatus)}
				onDismiss={handleDismissBulkStatus}
				errorsTitle="Bulk enrollment errors"
			/>

			{/* Tabs + Action buttons + Table content */}
			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="flex flex-col gap-4"
			>
				{/* Tab bar row */}
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0 flex-1">
						<ScrollableLineTabsRow>
							<TabsList
								variant="line"
								className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
							>
								<TabsTrigger value="organization" className="flex-none">
									<Building2 className="size-4" />
									Organization Users ({orgResult?.total ?? 0})
								</TabsTrigger>
								<TabsTrigger value="program" className="flex-none">
									<Briefcase className="size-4" />
									Program Users ({programResult?.total ?? 0})
								</TabsTrigger>
								<TabsTrigger value="vendor" className="flex-none">
									<ShoppingBag className="size-4" />
									Vendor Users ({vendorResult?.total ?? 0})
								</TabsTrigger>
								<TabsTrigger value="candidate" className="flex-none">
									<Users className="size-4" />
									Candidates ({candidateResult?.total ?? 0})
								</TabsTrigger>
							</TabsList>
						</ScrollableLineTabsRow>
					</div>

					<div className="flex shrink-0 items-center gap-2 pb-2">
						{activeTab === "organization" && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsBulkEnrollmentDialogOpen(true)}
								>
									<Upload className="size-4" />
									Bulk Enrollment
								</Button>
								<Button size="sm" onClick={() => setIsEnrollDialogOpen(true)}>
									<UserPlus className="size-4" />
									Enroll User
								</Button>
							</>
						)}
						{activeTab === "program" && (
							<Button
								size="sm"
								onClick={() => setIsEnrollProgramDialogOpen(true)}
							>
								<UserPlus className="size-4" />
								Enroll Program User
							</Button>
						)}
						{activeTab === "vendor" && (
							<Button
								size="sm"
								onClick={() => setIsEnrollVendorDialogOpen(true)}
							>
								<UserPlus className="size-4" />
								Enroll Vendor User
							</Button>
						)}
					</div>
				</div>

				<TabsContent value="organization" className="mt-4">
					<OrganizationUsersTabContent />
				</TabsContent>

				<TabsContent value="program" className="mt-4">
					<ProgramUsersTabContent />
				</TabsContent>

				<TabsContent value="vendor" className="mt-4">
					<VendorUsersTabContent />
				</TabsContent>

				<TabsContent value="candidate" className="mt-4">
					<CandidatesTabContent />
				</TabsContent>
			</Tabs>

			<BulkEnrollmentOrganizationUsersDialog
				open={isBulkEnrollmentDialogOpen}
				onOpenChange={setIsBulkEnrollmentDialogOpen}
				organizationId={org.id}
				onJobStarted={handleBulkJobStarted}
			/>
			<EnrollOrganizationUserDialog
				open={isEnrollDialogOpen}
				onOpenChange={setIsEnrollDialogOpen}
				organizationId={org.id}
			/>
			<EnrollProgramUserDialog
				open={isEnrollProgramDialogOpen}
				onOpenChange={setIsEnrollProgramDialogOpen}
				organizationId={org.id}
			/>
			<EnrollVendorUserDialog
				open={isEnrollVendorDialogOpen}
				onOpenChange={setIsEnrollVendorDialogOpen}
				organizationId={org.id}
			/>
			<RemoveMemberConfirmDialog
				memberName={memberToRemove?.memberName ?? null}
				isOpen={!!memberToRemove}
				onOpenChange={(open) => !open && setMemberToRemove(null)}
				onConfirm={handleRemoveConfirm}
				isPending={removeMemberMutation.isPending}
			/>
			<CustomAlertDialog
				isOpen={!!candidateToToggle}
				onClose={() => setCandidateToToggle(null)}
				onConfirm={handleConfirmToggleActive}
				isLoading={setActiveMutation.isPending}
				title={
					candidateToToggle?.isActive
						? "Deactivate candidate"
						: "Activate candidate"
				}
				description={
					candidateToToggle
						? candidateToToggle.isActive
							? `Are you sure you want to deactivate ${candidateToToggle.name}? They will lose access until reactivated.`
							: `Are you sure you want to activate ${candidateToToggle.name}?`
						: ""
				}
				cancelText="Cancel"
				confirmText={
					setActiveMutation.isPending
						? "Saving…"
						: candidateToToggle?.isActive
							? "Deactivate"
							: "Activate"
				}
			/>
			<CustomAlertDialog
				isOpen={!!candidateToDelete}
				onClose={() => setCandidateToDelete(null)}
				onConfirm={handleConfirmDeleteCandidate}
				isLoading={deleteCandidateMutation.isPending}
				title="Close candidate account"
				description={
					candidateToDelete
						? `Close ${candidateToDelete.name}'s account? Their user will be deactivated, active submissions withdrawn, saved/vendor-review lists cleared and all sessions revoked. This cannot be undone.`
						: ""
				}
				cancelText="Cancel"
				confirmText={
					deleteCandidateMutation.isPending ? "Closing…" : "Close account"
				}
			/>
			<SendOrganizationInvitationDialog
				organizationId={org.id}
				recipients={inviteRecipients}
				isOpen={isInviteDialogOpen}
				onOpenChange={handleInviteDialogOpenChange}
				orgTimezone={
					(org.timeZone as OrganizationTimezone) ?? OrganizationTimezone.CENTRAL
				}
			/>
		</div>
	);
}

export function OrganizationUserEnrollmentPageContent({
	organizationId,
}: Readonly<OrganizationUserEnrollmentPageContentProps>) {
	return (
		<OrganizationUserEnrollmentProvider organizationId={organizationId}>
			<OrganizationUserEnrollmentContent />
		</OrganizationUserEnrollmentProvider>
	);
}

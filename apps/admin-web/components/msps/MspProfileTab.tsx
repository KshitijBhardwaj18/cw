"use client";

import type {
	MspLinkedOrgWithOrganization,
	MspResponseType,
} from "@repo/shared";
import { formatCurrency, getLabel, TIMEZONE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import UserAvatar from "@repo/ui/general/UserAvatar";
import {
	Building2,
	Download,
	ExternalLink,
	FileText,
	Loader2,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { formatPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import {
	MSP_INDUSTRY_OPTIONS,
	MSP_ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/msp";
import { useMspLinkedOrgColumns } from "@/hooks/tables/use-msp-linked-org-columns";
import { useMspAbilities } from "@/hooks/use-msp-abilities";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useCreateMspLinkedOrg,
	useDeleteMspLinkedOrg,
	useMspFinancialSummary,
	useMspLinkedOrgAgreementSignedUrl,
	useMspLinkedOrgs,
	useUpdateMspLinkedOrg,
} from "@/queries/msp-linked-orgs.query";
import { useMsaSignedUrl } from "@/queries/msps.query";
import type { MspLinkOrgPayload } from "@/schemas/msp-link-org.schema";
import { LinkOrganizationDialog } from "./LinkOrganizationDialog";

type MspProfileTabProps = {
	msp: MspResponseType;
};

export function MspProfileTab({ msp }: Readonly<MspProfileTabProps>) {
	const {
		canCreateLinkedOrg,
		canUpdateLinkedOrg,
		canDeleteLinkedOrg,
		canReadMspFeeFields,
	} = useMspAbilities();
	const { fmtShortDate } = useUserTimezone();
	const msaSignedUrlMutation = useMsaSignedUrl();
	const [isLinkOrgOpen, setIsLinkOrgOpen] = useState(false);
	const [editingLink, setEditingLink] =
		useState<MspLinkedOrgWithOrganization | null>(null);
	const [deletingLink, setDeletingLink] =
		useState<MspLinkedOrgWithOrganization | null>(null);

	const linkedOrgsQuery = useMspLinkedOrgs(msp.id);
	const financialSummaryQuery = useMspFinancialSummary(msp.id);
	const createLinkedOrg = useCreateMspLinkedOrg(msp.id);
	const updateLinkedOrg = useUpdateMspLinkedOrg(msp.id);
	const deleteLinkedOrg = useDeleteMspLinkedOrg(msp.id);
	const agreementSignedUrl = useMspLinkedOrgAgreementSignedUrl(msp.id);

	const linkedOrgs = linkedOrgsQuery.data ?? [];
	const financialSummary = financialSummaryQuery.data;

	const openAgreementUrl = (
		row: MspLinkedOrgWithOrganization,
		download: boolean,
	) => {
		if (!row.hasAddendumAgreement) {
			toast.info("No addendum agreement on file");
			return;
		}
		agreementSignedUrl.mutate(row.id, {
			onSuccess: ({ signedUrl }) => {
				if (download) {
					const a = document.createElement("a");
					a.href = signedUrl;
					a.download = row.addendumAgreementFileName ?? "addendum.pdf";
					a.target = "_blank";
					a.click();
				} else {
					window.open(signedUrl, "_blank");
				}
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to fetch agreement",
				);
			},
		});
	};

	const { columns: linkedOrgColumns } = useMspLinkedOrgColumns({
		onEdit: canUpdateLinkedOrg ? (row) => setEditingLink(row) : undefined,
		onDelete: canDeleteLinkedOrg ? (row) => setDeletingLink(row) : undefined,
		onViewAgreement: (row) => openAgreementUrl(row, false),
		onDownloadAgreement: (row) => openAgreementUrl(row, true),
		showFeeFields: canReadMspFeeFields,
	});

	const handleCreateLink = (data: MspLinkOrgPayload) => {
		createLinkedOrg.mutate(
			{
				organizationId: data.organizationId,
				addendumAgreement: data.addendumFileKey,
				addendumAgreementFileName: data.addendumFileName,
				addendumRevisionDate: data.addendumRevisionDate ?? null,
				mspFeePercentage: data.mspFeePercentage,
				saasFeePercentage: data.saasFeePercentage,
				startDate: data.startDate,
				renewalDate: data.renewalDate,
				possibleCancellationDate: data.possibleCancellationDate ?? null,
			},
			{
				onSuccess: () => {
					setIsLinkOrgOpen(false);
					toast.success("Organization linked");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to link organization",
					);
				},
			},
		);
	};

	const handleUpdateLink = (data: MspLinkOrgPayload) => {
		if (!editingLink) return;
		updateLinkedOrg.mutate(
			{
				linkedOrgId: editingLink.id,
				payload: {
					...(data.addendumFileKey && data.addendumFileKey !== "__existing__"
						? {
								addendumAgreement: data.addendumFileKey,
								addendumAgreementFileName: data.addendumFileName,
							}
						: {}),
					addendumRevisionDate: data.addendumRevisionDate ?? null,
					mspFeePercentage: data.mspFeePercentage,
					saasFeePercentage: data.saasFeePercentage,
					startDate: data.startDate,
					renewalDate: data.renewalDate,
					possibleCancellationDate: data.possibleCancellationDate ?? null,
				},
			},
			{
				onSuccess: () => {
					setEditingLink(null);
					toast.success("Link updated");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to update link",
					);
				},
			},
		);
	};

	const handleDeleteLink = () => {
		if (!deletingLink) return;
		deleteLinkedOrg.mutate(deletingLink.id, {
			onSuccess: () => {
				toast.success("Organization unlinked");
				setDeletingLink(null);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to unlink organization",
				);
			},
		});
	};

	const hq = msp.headquarters;
	const billing = msp.billing;
	const industryLabel = getLabel(MSP_INDUSTRY_OPTIONS, msp.industry);
	const orgTypeLabel = getLabel(
		MSP_ORGANIZATION_TYPE_OPTIONS,
		msp.organizationType,
	);
	const timezoneLabel = getLabel(TIMEZONE_OPTIONS, msp.timeZone);

	const openMsaSignedUrl = (download: boolean) => {
		msaSignedUrlMutation.mutate(msp.id, {
			onSuccess: ({ signedUrl }) => {
				if (download) {
					const a = document.createElement("a");
					a.href = signedUrl;
					a.download = "msa-document.pdf";
					a.target = "_blank";
					a.click();
				} else {
					window.open(signedUrl, "_blank");
				}
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to get MSA document",
				);
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						MSP Core Profile Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<DetailItem label="MSP Name" value={msp.name} />
					<div className="space-y-1">
						<p className="text-muted-foreground text-sm">MSP Logo</p>
						<UserAvatar
							avatarUrl={msp.logo ?? ""}
							name={msp.name}
							className="size-16 rounded-xl"
							fallbackClassName="rounded-xl"
						/>
					</div>
					<DetailItem label="Industry" value={industryLabel} />
					<DetailItem label="Organization Type" value={orgTypeLabel} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Headquarters and Billing Addresses
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<DetailItem label="Headquarters Street" value={hq?.street} />
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<DetailItem label="City" value={hq?.city} />
						<DetailItem label="State" value={hq?.state} />
						<DetailItem label="Zip / Postal Code" value={hq?.zipCode} />
						<DetailItem label="Country" value={hq?.country} />
					</div>
					<DetailItem
						label="Billing address same as headquarters"
						value={msp.isBillingSame ? "Yes" : "No"}
					/>
					{!msp.isBillingSame && billing && (
						<div className="space-y-4 rounded-lg border p-4">
							<h4 className="text-sm font-medium">Billing Address</h4>
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<DetailItem label="Street" value={billing.street} />
								<DetailItem label="City" value={billing.city} />
								<DetailItem label="State" value={billing.state} />
								<DetailItem label="Zip / Postal Code" value={billing.zipCode} />
								<DetailItem label="Country" value={billing.country} />
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Contact and Operational Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<DetailItem
						label="Phone Number"
						value={formatPhoneNumber(msp.phoneNumber)}
					/>
					<DetailItem label="Time Zone" value={timezoneLabel} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Master Services Agreement (MSA)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{msp.hasMsaDocument ? (
						<>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="space-y-1">
									<p className="text-muted-foreground text-sm font-medium">
										MSA Document
									</p>
									<div className="flex items-center gap-2">
										<FileText className="text-muted-foreground size-4 shrink-0" />
										<span className="text-sm font-medium">
											{msp.msaFileName ?? "Document on file"}
										</span>
									</div>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-sm font-medium">
										Upload Date
									</p>
									<p className="text-sm font-medium">
										{fmtShortDate(msp.msaUploadedAt)}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-sm font-medium">
										Agreement Revision Date
									</p>
									<p className="text-sm font-medium">
										{fmtShortDate(msp.msaAgreementRevisionDate)}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={msaSignedUrlMutation.isPending}
									onClick={() => openMsaSignedUrl(true)}
								>
									{msaSignedUrlMutation.isPending ? (
										<Loader2
											className="size-4 animate-spin"
											data-icon="inline-start"
										/>
									) : (
										<Download className="size-4" data-icon="inline-start" />
									)}
									Download MSA
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={msaSignedUrlMutation.isPending}
									onClick={() => openMsaSignedUrl(false)}
								>
									<ExternalLink className="size-4" data-icon="inline-start" />
									View Agreement
								</Button>
							</div>
						</>
					) : (
						<p className="text-sm font-medium">No MSA document uploaded</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-2 p-6">
					<CardTitle className="text-base">Financial Summary</CardTitle>
					{financialSummaryQuery.isLoading || !financialSummary ? (
						<Skeleton className="mt-4 h-16 w-64 rounded-lg" />
					) : (
						<div className="flex flex-wrap items-start justify-between gap-4 pt-2">
							<div className="space-y-1">
								<p className="text-muted-foreground text-sm">
									Total Portfolio Value
								</p>
								<p className="text-3xl font-bold">
									{formatCurrency(financialSummary.totalPortfolioValue)}
								</p>
							</div>
							<p className="text-muted-foreground max-w-xs text-right text-sm">
								Sum of Bill Rates times Hours for all requisitions created by
								this MSP (updated dynamically)
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-2">
							{financialSummaryQuery.isLoading || !financialSummary ? (
								<>
									<Skeleton className="h-5 w-72 rounded" />
									<Skeleton className="h-5 w-72 rounded" />
								</>
							) : (
								canReadMspFeeFields && (
									<>
										<div className="flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">
												Total Expected MSP Revenue:
											</span>
											<span className="font-bold">
												{formatCurrency(
													financialSummary.totalExpectedMspRevenue,
												)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">
												Total Expected SAAS Revenue:
											</span>
											<span className="font-bold">
												{formatCurrency(
													financialSummary.totalExpectedSasRevenue,
												)}
											</span>
										</div>
									</>
								)
							)}
						</div>
						{canCreateLinkedOrg && (
							<Button
								type="button"
								variant="outline"
								className="text-primary border-primary hover:bg-primary/5 hover:text-primary shrink-0"
								onClick={() => setIsLinkOrgOpen(true)}
							>
								<Plus className="mr-2 size-4" aria-hidden />
								Link Organization
							</Button>
						)}
					</div>
					{linkedOrgsQuery.isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full rounded-lg" />
							<Skeleton className="h-32 w-full rounded-lg" />
						</div>
					) : linkedOrgs.length === 0 ? (
						<Empty className="border-muted/40 py-8">
							<EmptyMedia variant="icon">
								<Building2 className="size-8" aria-hidden />
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle>No linked organizations</EmptyTitle>
								<EmptyDescription>
									Use Link Organization to connect organizations for fee
									sharing.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<CustomTable
							columns={linkedOrgColumns}
							data={linkedOrgs}
							enablePagination={true}
							pageSize={10}
							className="border-none shadow-none"
						/>
					)}
				</CardContent>
			</Card>

			{isLinkOrgOpen && (
				<LinkOrganizationDialog
					mspId={msp.id}
					isOpen={isLinkOrgOpen}
					onClose={() => setIsLinkOrgOpen(false)}
					onLink={handleCreateLink}
					isPending={createLinkedOrg.isPending}
					excludeOrganizationIds={linkedOrgs.map((l) => l.organizationId)}
				/>
			)}

			{editingLink && (
				<LinkOrganizationDialog
					mspId={msp.id}
					isOpen={!!editingLink}
					onClose={() => setEditingLink(null)}
					onLink={handleUpdateLink}
					isPending={updateLinkedOrg.isPending}
					initialLink={editingLink}
				/>
			)}

			<CustomAlertDialog
				isOpen={!!deletingLink}
				onClose={() => setDeletingLink(null)}
				onConfirm={handleDeleteLink}
				isLoading={deleteLinkedOrg.isPending}
				title="Unlink Organization"
				description={`Are you sure you want to unlink ${deletingLink?.organization.name} from this MSP? This action cannot be undone.`}
				cancelText="Cancel"
				confirmText={deleteLinkedOrg.isPending ? "Unlinking..." : "Unlink"}
			/>
		</div>
	);
}

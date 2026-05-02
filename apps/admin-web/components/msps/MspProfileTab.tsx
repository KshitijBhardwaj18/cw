"use client";

import type { MspResponseType } from "@repo/shared";
import {
	formatCurrency,
	formatDate,
	getLabel,
	TIMEZONE_OPTIONS,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { CustomTable } from "@repo/ui/general/CustomTable";
import UserAvatar from "@repo/ui/general/UserAvatar";
import { Download, ExternalLink, FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { formatPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import {
	MOCK_MSP_FINANCIAL_SUMMARY,
	MOCK_MSP_LINKED_ORGANIZATIONS,
	MSP_INDUSTRY_OPTIONS,
	MSP_ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/msp";
import { useMspLinkedOrgColumns } from "@/hooks/tables/use-msp-linked-org-columns";
import { useMsaSignedUrl } from "@/queries/msps.query";
import { LinkOrganizationDialog } from "./LinkOrganizationDialog";

type MspProfileTabProps = {
	msp: MspResponseType;
};

export function MspProfileTab({ msp }: MspProfileTabProps) {
	const msaSignedUrlMutation = useMsaSignedUrl();
	const [isLinkOrgOpen, setIsLinkOrgOpen] = useState(false);

	// TODO: Replace with real backend data (useMspLinkedOrganizationsQuery)
	const linkedOrgs = MOCK_MSP_LINKED_ORGANIZATIONS;

	const { columns: linkedOrgColumns } = useMspLinkedOrgColumns({
		onEdit: (row) => toast.info(`Edit ${row.organization.name}`),
		onDelete: (row) => toast.info(`Delete ${row.organization.name}`),
	});

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
					<div className="grid gap-6 sm:grid-cols-2">
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
							<div className="grid gap-6 sm:grid-cols-2">
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
							<div className="grid gap-4 sm:grid-cols-3">
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
										{msp.msaUploadedAt ? formatDate(msp.msaUploadedAt) : "—"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-sm font-medium">
										Agreement Revision Date
									</p>
									<p className="text-sm font-medium">
										{msp.msaAgreementRevisionDate
											? formatDate(msp.msaAgreementRevisionDate)
											: "—"}
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
				<CardHeader>
					<CardTitle className="text-xl font-bold">Financial Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Total Portfolio Value
							</p>
							<p className="text-3xl font-bold tracking-tight">
								{formatCurrency(MOCK_MSP_FINANCIAL_SUMMARY.totalPortfolioValue)}
							</p>
						</div>
						<p className="text-muted-foreground text-xs text-right max-w-[300px]">
							Sum of Bill Rates times Hours for all requisitions created by this
							MSP (updated dynamically)
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-6">
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<div className="flex items-baseline gap-2">
								<p className="text-muted-foreground text-sm font-medium">
									Total Expected MSP Revenue:
								</p>
								<p className="text-lg font-bold">
									{formatCurrency(
										MOCK_MSP_FINANCIAL_SUMMARY.totalExpectedMspRevenue,
									)}
								</p>
							</div>
							<div className="flex items-baseline gap-2">
								<p className="text-muted-foreground text-sm font-medium">
									Total Expected SAS Revenue:
								</p>
								<p className="text-lg font-bold">
									{formatCurrency(
										MOCK_MSP_FINANCIAL_SUMMARY.totalExpectedSaasRevenue,
									)}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							className="text-primary border-primary hover:bg-primary/5 hover:text-primary"
							onClick={() => setIsLinkOrgOpen(true)}
						>
							<Plus className="mr-2 size-4" />
							Link Organization
						</Button>
					</div>
					<CustomTable
						columns={linkedOrgColumns}
						data={linkedOrgs}
						enablePagination={true}
						pageSize={10}
						className="border-none shadow-none"
					/>
				</CardContent>
			</Card>

			<LinkOrganizationDialog
				mspId={msp.id}
				isOpen={isLinkOrgOpen}
				onClose={() => setIsLinkOrgOpen(false)}
				onLink={(data) => {
					// TODO: Add real mutation logic here to persist the link
					console.log("Linking org:", data);
					setIsLinkOrgOpen(false);
					toast.success("Organization linked successfully (mock)");
				}}
			/>
		</div>
	);
}

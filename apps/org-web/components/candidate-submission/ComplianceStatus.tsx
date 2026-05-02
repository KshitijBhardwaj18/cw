"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Banner } from "@repo/ui/general/Banner";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { TintedBar } from "@repo/ui/general/TintedBar";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { COMPLIANCE_STATUS_CONFIG } from "@/constants/candidate/submissions";
import type { CandidateSubmissionDetail } from "@/types/candidate-submission";

interface ComplianceStatusProps {
	heading: string;
	complianceStatus: CandidateSubmissionDetail["complianceStatus"];
	documentsBanner: {
		visible: boolean;
		message: string | null;
	};
}

export function ComplianceStatus({
	heading,
	complianceStatus,
	documentsBanner,
}: ComplianceStatusProps) {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const paginatedItems = complianceStatus.items.slice(
		(page - 1) * limit,
		page * limit,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-3 text-lg">
					<ShieldCheck className="text-primary size-5" />
					{heading}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex flex-wrap gap-4 text-sm font-medium">
					<div className="flex items-center gap-2 text-emerald-600">
						<CheckCircle2 className="size-4" />
						{complianceStatus.approved} Approved
					</div>
					<div className="flex items-center gap-2 text-amber-600">
						<Clock className="size-4" />
						{complianceStatus.pending} Pending
					</div>
					<div className="flex items-center gap-2 text-red-600">
						<XCircle className="size-4" />
						{complianceStatus.missing} Missing
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{paginatedItems.map((item) => {
						const { tone, icon: Icon } =
							COMPLIANCE_STATUS_CONFIG[item.status] ||
							COMPLIANCE_STATUS_CONFIG.Expired;

						return (
							<TintedBar
								key={item.label}
								tone={tone}
								label={item.label}
								statusLabel={item.status}
								icon={Icon}
							/>
						);
					})}
				</div>

				{complianceStatus.items.length > 0 && (
					<PaginationControls
						currentPage={page}
						pageCount={Math.ceil(complianceStatus.items.length / limit)}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
					/>
				)}

				{documentsBanner.visible && documentsBanner.message ? (
					<Banner
						variant="warning"
						flow="col"
						icon={<AlertCircle className="size-4" />}
						description={documentsBanner.message}
						tintedText
					/>
				) : null}
			</CardContent>
		</Card>
	);
}

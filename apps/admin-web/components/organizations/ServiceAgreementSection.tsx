"use client";

import { DocumentUploadCard } from "@repo/ui/general/DocumentUploadCard";
import { toast } from "sonner";
import { useOrganizationServiceAgreementSignedUrl } from "@/queries/organizations.query";

type ServiceAgreementSectionProps = {
	agreementFile: File | null;
	agreementUploadDate: string | null;
	onUploadClick: () => void;
	onReplace: () => void;
	isPending?: boolean;
	/** When editing, existing agreement key from organization (S3 key; use getSignedUrl to access) */
	existingAgreementKey?: string | null;
	/** Organization ID; required when existingAgreementKey is set to fetch signed URL */
	organizationId?: string;
	/** Service agreement description (controlled) */
	description?: string;
	/** Called when description changes */
	onDescriptionChange?: (value: string) => void;
};

const displayNameFromKey = (key: string) =>
	key.split("/").pop() ?? "Service Agreement";

export function ServiceAgreementSection({
	agreementFile,
	agreementUploadDate,
	onUploadClick,
	onReplace,
	isPending = false,
	existingAgreementKey,
	organizationId,
	description = "",
	onDescriptionChange,
}: ServiceAgreementSectionProps) {
	const signedUrlMutation = useOrganizationServiceAgreementSignedUrl();
	const hasExistingDocument = !!existingAgreementKey;

	const openSignedUrl = (download: boolean) => {
		if (!organizationId) return;
		const name =
			agreementFile?.name ??
			(existingAgreementKey
				? displayNameFromKey(existingAgreementKey)
				: "service-agreement");
		signedUrlMutation.mutate(organizationId, {
			onSuccess: ({ signedUrl }) => {
				if (download) {
					const a = document.createElement("a");
					a.href = signedUrl;
					a.download = name;
					a.target = "_blank";
					a.style.display = "none";
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
				} else {
					window.open(signedUrl, "_blank");
				}
			},
			onError: (err) =>
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to get service agreement document",
				),
		});
	};

	return (
		<div className="space-y-4">
			<DocumentUploadCard
				uploadButtonText="Upload Service Agreement"
				hint="PDF, CSV, XLSX, XLS, PNG, JPEG — max 10MB"
				file={agreementFile}
				existingFileName={
					existingAgreementKey ? displayNameFromKey(existingAgreementKey) : null
				}
				uploadDate={agreementUploadDate}
				hasExistingDocument={hasExistingDocument}
				onUploadClick={onUploadClick}
				onReplace={onReplace}
				isPending={isPending}
				onViewExisting={
					hasExistingDocument && organizationId
						? () => openSignedUrl(false)
						: undefined
				}
				onDownloadExisting={
					hasExistingDocument && organizationId
						? () => openSignedUrl(true)
						: undefined
				}
				isPendingSignedUrl={signedUrlMutation.isPending}
				description={description}
				onDescriptionChange={onDescriptionChange}
			/>
		</div>
	);
}

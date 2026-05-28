"use client";

import { useState } from "react";
import {
	useVendorInternalUpload,
	useVendorUploadJobStatus,
} from "@/queries/vendor-timekeeping.queries";
import { InternalTimecardUploadDialog } from "../shared/InternalTimecardUploadDialog";

interface VendorInternalUploadDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function VendorInternalUploadDialog({
	isOpen,
	onClose,
}: Readonly<VendorInternalUploadDialogProps>) {
	const [jobId, setJobId] = useState<string | null>(null);
	const uploadMutation = useVendorInternalUpload();
	const jobQuery = useVendorUploadJobStatus(jobId, !!jobId);
	return (
		<InternalTimecardUploadDialog
			isOpen={isOpen}
			onClose={onClose}
			description="Upload bulk timecard entries for your own candidates using the system template"
			jobId={jobId}
			onJobIdChange={setJobId}
			uploadMutation={uploadMutation}
			jobQuery={jobQuery}
		/>
	);
}

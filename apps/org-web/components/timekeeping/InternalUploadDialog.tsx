"use client";

import { useState } from "react";
import {
	useInternalUpload,
	useUploadJobStatus,
} from "@/queries/timekeeping.queries";
import { InternalTimecardUploadDialog } from "../shared/InternalTimecardUploadDialog";

interface InternalUploadDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function InternalUploadDialog({
	isOpen,
	onClose,
}: Readonly<InternalUploadDialogProps>) {
	const [jobId, setJobId] = useState<string | null>(null);
	const uploadMutation = useInternalUpload();
	const jobQuery = useUploadJobStatus(jobId, !!jobId);
	return (
		<InternalTimecardUploadDialog
			isOpen={isOpen}
			onClose={onClose}
			jobId={jobId}
			onJobIdChange={setJobId}
			uploadMutation={uploadMutation}
			jobQuery={jobQuery}
		/>
	);
}

import LoadingScreen from "@repo/ui/general/LoadingScreen";

const RequisitionComplianceChecklistLoading = () => {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading checklist templates..." />
		</div>
	);
};

export default RequisitionComplianceChecklistLoading;

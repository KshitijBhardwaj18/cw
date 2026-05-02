import { Button } from "@repo/ui/components/button";
import { AlertTriangle } from "lucide-react";

type MatchingLogicActionsProps = {
	hasUnsavedChanges: boolean;
	isSaving: boolean;
	canSave: boolean;
	onReset: () => void;
	onSave: () => void;
};

const MatchingLogicActions = ({
	hasUnsavedChanges,
	isSaving,
	canSave,
	onReset,
	onSave,
}: MatchingLogicActionsProps) => (
	<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<Button variant="outline" onClick={onReset} disabled={isSaving}>
			Reset to Defaults
		</Button>
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
			{hasUnsavedChanges && (
				<span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
					<AlertTriangle className="size-4 shrink-0" />
					Unsaved changes
				</span>
			)}
			<Button
				onClick={onSave}
				disabled={!hasUnsavedChanges || isSaving || !canSave}
			>
				{isSaving ? "Saving..." : "Save Configuration"}
			</Button>
		</div>
	</div>
);

export default MatchingLogicActions;

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useNavigationGuard } from "next-navigation-guard";
import { useState } from "react";
import type { MatchingLogicFormApi } from "@/hooks/use-matching-logic-form";
import { useMatchingLogicForm } from "@/hooks/use-matching-logic-form";
import type { MatchingCriterionItemFormValues } from "@/schemas/matching-logic.schema";
import ExampleCalculationCard from "./ExampleCalculationCard";
import MatchingCriteriaCard from "./MatchingCriteriaCard";
import MatchingLogicActions from "./MatchingLogicActions";
import TotalWeightCard from "./TotalWeightCard";

type MatchingLogicContentProps = {
	form: MatchingLogicFormApi;
	criteria: MatchingCriterionItemFormValues[];
	isDirty: boolean;
	saveError: string | null;
	isSaving: boolean;
	onReset: () => void;
	onSave: () => void;
	onRetrySave: () => void;
};

function MatchingLogicContent({
	form,
	criteria,
	isDirty,
	saveError,
	isSaving,
	onReset,
	onSave,
	onRetrySave,
}: MatchingLogicContentProps) {
	const pathname = usePathname();
	const navGuard = useNavigationGuard({
		enabled: (info) => isDirty && info.to !== pathname,
	});
	const [showResetConfirm, setShowResetConfirm] = useState(false);

	const handleResetClick = () => {
		if (isDirty) {
			setShowResetConfirm(true);
		} else {
			onReset();
		}
	};

	const totalWeight = criteria
		.filter((c) => c.active)
		.reduce((sum, c) => sum + c.weight, 0);
	const canSave = totalWeight === 100;

	return (
		<>
			{saveError && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
						<span>{saveError}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={onRetrySave}
							className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<TotalWeightCard totalWeight={totalWeight} />

			<MatchingCriteriaCard form={form} criteria={criteria} />

			<ExampleCalculationCard localCriteria={criteria} />

			<MatchingLogicActions
				hasUnsavedChanges={!!isDirty}
				isSaving={isSaving}
				canSave={canSave}
				onReset={handleResetClick}
				onSave={onSave}
			/>

			<CustomAlertDialog
				isOpen={navGuard.active}
				onClose={navGuard.reject}
				onConfirm={navGuard.accept}
				title="Unsaved Changes"
				description="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
				cancelText="Cancel"
				confirmText="Leave Page"
			/>

			<CustomAlertDialog
				isOpen={showResetConfirm}
				onClose={() => setShowResetConfirm(false)}
				onConfirm={() => {
					setShowResetConfirm(false);
					onReset();
				}}
				title="Reset to Default Configuration"
				description="This will discard all unsaved changes and apply the default configuration. Are you sure?"
				cancelText="Cancel"
				confirmText="Reset"
			/>
		</>
	);
}

type MatchingLogicConfigurationProps = {
	organizationId: string;
};

const MatchingLogicConfiguration = ({
	organizationId,
}: MatchingLogicConfigurationProps) => {
	const {
		form,
		saveError,
		handleReset,
		handleSave,
		handleRetrySave,
		isSaving,
	} = useMatchingLogicForm(organizationId);

	return (
		<div className="mt-6 space-y-6">
			<form.Subscribe
				selector={(state) => ({
					criteria: state.values.criteria,
					isDirty: state.isDirty,
				})}
			>
				{({ criteria, isDirty }) => (
					<MatchingLogicContent
						form={form}
						criteria={criteria}
						isDirty={isDirty}
						saveError={saveError}
						isSaving={isSaving}
						onReset={handleReset}
						onSave={handleSave}
						onRetrySave={handleRetrySave}
					/>
				)}
			</form.Subscribe>
		</div>
	);
};

export default MatchingLogicConfiguration;

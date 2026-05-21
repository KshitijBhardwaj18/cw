"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface UpdateRatesDialogProps {
	mspRate: number;
	saasRate: number;
	onSave: (mspRate: number, saasRate: number) => void | Promise<void>;
	isSaving?: boolean;
	disabled?: boolean;
}

export function UpdateRatesDialog({
	mspRate,
	saasRate,
	onSave,
	isSaving = false,
	disabled = false,
}: UpdateRatesDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [tempMspRate, setTempMspRate] = useState(mspRate);
	const [tempSaasRate, setTempSaasRate] = useState(saasRate);

	const handleOpen = () => {
		setTempMspRate(mspRate);
		setTempSaasRate(saasRate);
		setIsOpen(true);
	};

	const handleSave = async () => {
		try {
			await Promise.resolve(onSave(tempMspRate, tempSaasRate));
			setIsOpen(false);
		} catch {
			// Error surfaced by caller (e.g. toast); keep dialog open
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="default"
					className="w-fit gap-2"
					disabled={disabled || isSaving}
					onClick={handleOpen}
				>
					<Pencil data-icon="inline-start" />
					Edit Platform Rates
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Update Platform Rates</DialogTitle>
					<DialogDescription>
						Update the platform and service fee percentages for this
						organization.
					</DialogDescription>
				</DialogHeader>
				<FieldGroup className="py-4">
					<Field>
						<FieldLabel htmlFor="mspRate">MSP Rate (%)</FieldLabel>
						<Input
							id="mspRate"
							type="number"
							step="0.01"
							value={tempMspRate}
							onChange={(e) => setTempMspRate(Number(e.target.value))}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="saasRate">SaaS Rate (%)</FieldLabel>
						<Input
							id="saasRate"
							type="number"
							step="0.01"
							value={tempSaasRate}
							onChange={(e) => setTempSaasRate(Number(e.target.value))}
						/>
					</Field>
				</FieldGroup>
				<DialogFooter>
					<Button
						variant="outline"
						disabled={isSaving}
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</Button>
					<Button disabled={isSaving} onClick={handleSave}>
						{isSaving ? "Saving…" : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

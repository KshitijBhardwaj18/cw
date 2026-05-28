import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle } from "lucide-react";
import AlertMessage from "./AlertMessage";
import LoadingButton from "./LoadingButton";

interface CustomAlertDialogProps {
	isOpen: boolean;
	onClose?: () => void;
	onConfirm?: () => void;
	isLoading?: boolean;
	title?: string;
	description?: string;
	cancelText?: string;
	confirmText?: string;
	headingClassName?: string;
	confirmButtonClassName?: string;
	icon?: React.ReactNode;
	iconContainerClassName?: string;
	error?: string | null;
}

export function CustomAlertDialog({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	cancelText,
	confirmText,
	headingClassName = "text-center",
	confirmButtonClassName = "bg-destructive hover:bg-destructive/80 text-white",
	icon = <AlertTriangle className="text-destructive size-8" />,
	iconContainerClassName = "bg-destructive/10",
	error,
}: Readonly<CustomAlertDialogProps>) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="no-scrollbar w-full sm:max-w-lg overflow-y-auto max-sm:max-w-sm max-sm:rounded-lg">
				<DialogHeader className="flex flex-col items-center justify-center gap-4">
					<div
						className={cn(
							"flex w-fit items-center justify-center rounded-full p-4",
							iconContainerClassName,
						)}
					>
						{icon}
					</div>
					<DialogTitle className={cn("text-center", headingClassName)}>
						{title}
					</DialogTitle>
					<DialogDescription className="text-center">
						{description}
					</DialogDescription>
					{error && <AlertMessage message={error} variant="destructive" />}
				</DialogHeader>
				<DialogFooter className="grid grid-cols-2 max-sm:flex-col max-sm:gap-2">
					{cancelText && (
						<Button variant="outline" disabled={isLoading} onClick={onClose}>
							{cancelText}
						</Button>
					)}
					{confirmText && (
						<LoadingButton
							disabled={isLoading}
							onClick={onConfirm}
							className={confirmButtonClassName}
							isLoading={isLoading}
						>
							{confirmText}
						</LoadingButton>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

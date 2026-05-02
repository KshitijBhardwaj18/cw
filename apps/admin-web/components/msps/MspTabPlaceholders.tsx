import { Card, CardContent } from "@repo/ui/components/card";

export function DocumentsTabPlaceholder() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-16 text-center">
				<p className="text-muted-foreground text-sm">
					Documents tab coming soon.
				</p>
			</CardContent>
		</Card>
	);
}

export function NotesTabPlaceholder() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-16 text-center">
				<p className="text-muted-foreground text-sm">Notes tab coming soon.</p>
			</CardContent>
		</Card>
	);
}

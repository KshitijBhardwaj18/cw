import { Badge } from "@repo/ui/components/badge";

type ProfileFieldProps = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	readonly?: boolean;
};

export function ProfileField({
	icon: Icon,
	label,
	value,
	readonly = false,
}: ProfileFieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Icon className="h-4 w-4" />
				<div className="font-medium text-sm">{label}</div>
				{readonly && <Badge variant="secondary">Read-only</Badge>}
			</div>
			<p className="text-muted-foreground text-sm">{value || "—"}</p>
		</div>
	);
}

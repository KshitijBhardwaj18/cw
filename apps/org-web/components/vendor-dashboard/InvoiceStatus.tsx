import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Clock, type LucideIcon, XCircle } from "lucide-react";

interface InvoiceStatusConfig {
	icon: LucideIcon;
	bg: string;
	text: string;
}

const INVOICE_TYPE_MAP: Record<string, InvoiceStatusConfig> = {
	paid: {
		icon: CheckCircle2,
		bg: "bg-green-50",
		text: "text-green-700",
	},
	pending: {
		icon: Clock,
		bg: "bg-amber-50",
		text: "text-amber-700",
	},
	disputed: {
		icon: XCircle,
		bg: "bg-destructive/10",
		text: "text-destructive",
	},
};

type InvoiceStatusProps = {
	items: Array<{
		label: string;
		value: number;
		status: "paid" | "pending" | "disputed";
	}>;
};

export function InvoiceStatus({ items }: Readonly<InvoiceStatusProps>) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Invoice Status</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{items.map((item) => {
					const config =
						INVOICE_TYPE_MAP[item.status] ?? INVOICE_TYPE_MAP.pending;

					return (
						<DetailItem
							key={item.label}
							label={item.label}
							value={item.value}
							icon={config.icon}
							flow="row"
							className={cn("rounded px-4 py-3", config.bg, config.text)}
							labelClassName={cn("font-medium", config.text)}
							valueClassName="text-xl font-semibold"
						/>
					);
				})}
			</CardContent>
		</Card>
	);
}

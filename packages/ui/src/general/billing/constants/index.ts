import type { BadgeVariants } from "@repo/ui/components/badge";
import type { InvoiceStatus } from "../types";

export const invoiceStatusVariants: Record<InvoiceStatus, BadgeVariants> = {
	Draft: "inactive",
	"Pending Approval": "warning",
	Disputed: "error",
	Finalized: "info",
	Paid: "success",
	Overdue: "destructive",
};

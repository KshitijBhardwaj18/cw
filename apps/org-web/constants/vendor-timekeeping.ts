import type { BadgeVariants } from "@repo/ui/components/badge";
import type { VendorTimekeepingStatus } from "../types/vendor-timekeeping";

export const VENDOR_TIMEKEEPING_STATUS_CONFIG: Record<
	VendorTimekeepingStatus,
	{ label: string; variant: BadgeVariants }
> = {
	draft: { label: "Draft", variant: "secondary" },
	submitted: { label: "Submitted", variant: "info" },
	approved: { label: "Approved", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	disputed: { label: "Disputed", variant: "warning" },
};

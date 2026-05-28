"use client";

import { Action, subjectInstance } from "@repo/casl";
import { AccessDenied } from "@repo/ui/general/AccessDenied";
import { useAuth } from "@/contexts";

type BillingInvoiceAccessGuardProps = {
	children: React.ReactNode;
};

export function BillingInvoiceAccessGuard({
	children,
}: Readonly<BillingInvoiceAccessGuardProps>) {
	const { ability } = useAuth();
	const instance = subjectInstance("Billing", {
		tab: "invoice-history",
	});
	const canAccess =
		ability.can(Action.Read, instance) || ability.can(Action.List, instance);

	if (!canAccess) {
		return (
			<AccessDenied
				permissions={[{ action: "read", subject: "Billing (invoice-history)" }]}
			/>
		);
	}

	return children;
}

"use client";

import { canAccessBillingPage } from "@repo/casl";
import { AccessDenied } from "@repo/ui/general/AccessDenied";
import { useAuth } from "@/contexts";

type BillingAccessGuardProps = {
	children: React.ReactNode;
};

export function BillingAccessGuard({
	children,
}: Readonly<BillingAccessGuardProps>) {
	const { ability } = useAuth();

	if (!canAccessBillingPage(ability)) {
		return (
			<AccessDenied
				permissions={[
					{ action: "read", subject: "Billing (billing-configuration)" },
					{ action: "read", subject: "Billing (invoice-history)" },
					{ action: "read", subject: "Billing (rates)" },
				]}
			/>
		);
	}

	return children;
}

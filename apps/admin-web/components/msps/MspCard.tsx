"use client";

import type { MspResponseType } from "@repo/shared";
import { formatCurrency } from "@repo/shared";
import { Card, CardContent } from "@repo/ui/components/card";
import UserAvatar from "@repo/ui/general/UserAvatar";
import { Building2, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useMspAbilities } from "@/hooks/use-msp-abilities";
import { useUserTimezone } from "@/hooks/use-user-timezone";

interface MspCardProps {
	msp: MspResponseType;
}

export function MspCard({ msp }: Readonly<MspCardProps>) {
	const { canReadMspFeeFields } = useMspAbilities();
	const { fmtShortDate } = useUserTimezone();
	const orgCount = msp._count?.msplinkedOrgs ?? 0;
	const location = msp.headquarters
		? `${msp.headquarters.city}, ${msp.headquarters.state}`
		: "—";
	const createdAt = fmtShortDate(msp.createdAt);
	const totalAnnualSpend = 0;

	if (!msp) return null;

	return (
		<Link href={`/msps/${msp.id}`} className="block">
			<Card className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer">
				<CardContent className="flex flex-col gap-4 px-6">
					<div>
						<UserAvatar
							avatarUrl={msp.logo ?? ""}
							name={msp.name}
							className="size-16 rounded-xl"
							fallbackClassName="rounded-xl"
						/>
					</div>
					<h3 className="font-semibold">{msp.name}</h3>
					<div className="flex flex-col gap-2 text-muted-foreground text-sm">
						<div className="flex items-center gap-2">
							<Building2 className="size-4 shrink-0" />
							<span className="truncate">{location}</span>
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="size-4 shrink-0" />
							<span>Created: {createdAt}</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="size-4 shrink-0" />
							<span>
								{orgCount} {orgCount === 1 ? "organization" : "organizations"}
							</span>
						</div>
					</div>
					{canReadMspFeeFields && (
						<div className="mt-auto border-t pt-4">
							<p className="text-2xl font-bold">
								{totalAnnualSpend > 0 ? formatCurrency(totalAnnualSpend) : "-"}
							</p>
							<p className="text-muted-foreground text-sm">
								Total Annual Spend
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}

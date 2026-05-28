"use client";

import { Action, canReadMspLinkedOrgField } from "@repo/casl";
import { useAuth } from "@/contexts";

export function useMspAbilities() {
	const { ability } = useAuth();

	return {
		canCreateMsp: ability.can(Action.Create, "MSP"),
		canUpdateMsp: ability.can(Action.Update, "MSP"),
		canDeleteMsp: ability.can(Action.Delete, "MSP"),
		canCreateLinkedOrg: ability.can(Action.Create, "MSPLinkedOrg"),
		canUpdateLinkedOrg: ability.can(Action.Update, "MSPLinkedOrg"),
		canDeleteLinkedOrg: ability.can(Action.Delete, "MSPLinkedOrg"),
		canReadMspFeeFields: canReadMspLinkedOrgField(ability, "mspFeePercentage"),
	};
}

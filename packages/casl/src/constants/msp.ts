import type { AppAbility } from "../types/ability";
import { Action } from "../types/actions";

export const MSPLINKEDORG_FEE_FIELDS = [
	"mspFeePercentage",
	"saasFeePercentage",
] as const;

export type MspLinkedOrgFeeField = (typeof MSPLINKEDORG_FEE_FIELDS)[number];

export function canReadMspLinkedOrgField(
	ability: AppAbility,
	field: MspLinkedOrgFeeField,
): boolean {
	return ability.can(Action.Read, "MSPLinkedOrg", field);
}

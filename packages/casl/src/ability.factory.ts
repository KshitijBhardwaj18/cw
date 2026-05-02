import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { User } from "@repo/db";
import { definePlatformRules } from "./rules/platform";
import type { AppAbility } from "./types/ability";

export function defineAbility(user: User): AppAbility {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(
		createPrismaAbility,
	);

	definePlatformRules(can, cannot, user);

	return build();
}

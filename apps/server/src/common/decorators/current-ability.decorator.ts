import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AppAbility } from "@repo/casl";

export const CurrentAbility = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): AppAbility => {
		const request = ctx.switchToHttp().getRequest();
		return request.ability;
	},
);

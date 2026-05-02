import { randomBytes } from "node:crypto";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import type { BetterAuthPlugin } from "better-auth/types";
import { z } from "zod";
import type { prismaClient } from "../auth";

const IDENTIFIER_PREFIX = "org-delegation:";

type DelegationValue = {
	userId: string;
	organizationId: string;
	callbackURL: string;
	issuedByUserId: string;
};

export function orgDelegationPlugin(opts: {
	prisma: typeof prismaClient;
	expiresIn?: number;
	delegationSessionExpiresInSeconds?: number;
	errorRedirectURL: string;
}): BetterAuthPlugin {
	const ttlSeconds = opts.expiresIn ?? 120;
	const delegationSessionSeconds =
		opts.delegationSessionExpiresInSeconds ?? 60 * 60;

	return {
		id: "org-delegation",
		endpoints: {
			createOrgDelegation: createAuthEndpoint(
				"/delegation/create",
				{
					method: "POST",
					body: z.object({
						userId: z.string().uuid(),
						organizationId: z.string().uuid(),
						callbackURL: z.string().url(),
						issuedByUserId: z.string().uuid(),
					}),
					metadata: { SERVER_ONLY: true },
				},
				async (ctx) => {
					const token = randomBytes(32).toString("base64url");
					const value: DelegationValue = {
						userId: ctx.body.userId,
						organizationId: ctx.body.organizationId,
						callbackURL: ctx.body.callbackURL,
						issuedByUserId: ctx.body.issuedByUserId,
					};
					await ctx.context.internalAdapter.createVerificationValue({
						identifier: `${IDENTIFIER_PREFIX}${token}`,
						value: JSON.stringify(value),
						expiresAt: new Date(Date.now() + ttlSeconds * 1000),
					});

					const origin = new URL(ctx.context.baseURL).origin;
					const basePath = (
						ctx.context.options.basePath ?? "/api/auth"
					).replace(/\/$/, "");
					const consumePath = `${basePath}/delegation/consume`.replace(
						/\/{2,}/g,
						"/",
					);
					const url = new URL(consumePath, origin);
					url.searchParams.set("token", token);
					return ctx.json({ url: url.toString() });
				},
			),

			consumeOrgDelegation: createAuthEndpoint(
				"/delegation/consume",
				{
					method: "GET",
					query: z.object({ token: z.string().min(1) }),
					requireHeaders: true,
				},
				async (ctx) => {
					const identifier = `${IDENTIFIER_PREFIX}${ctx.query.token}`;
					const errorURL = new URL(opts.errorRedirectURL);

					const row =
						await ctx.context.internalAdapter.findVerificationValue(identifier);
					if (!row) {
						errorURL.searchParams.set("error", "invalid_token");
						throw ctx.redirect(errorURL.toString());
					}
					if (row.expiresAt < new Date()) {
						await ctx.context.internalAdapter.deleteVerificationByIdentifier(
							identifier,
						);
						errorURL.searchParams.set("error", "expired_token");
						throw ctx.redirect(errorURL.toString());
					}
					await ctx.context.internalAdapter.deleteVerificationByIdentifier(
						identifier,
					);

					let parsed: DelegationValue;
					try {
						parsed = JSON.parse(row.value) as DelegationValue;
					} catch {
						errorURL.searchParams.set("error", "invalid_token");
						throw ctx.redirect(errorURL.toString());
					}

					const user = await opts.prisma.user.findUnique({
						where: { id: parsed.userId },
					});
					if (!user) {
						errorURL.searchParams.set("error", "user_not_found");
						throw ctx.redirect(errorURL.toString());
					}

					const session = await ctx.context.internalAdapter.createSession(
						user.id,
					);
					if (!session) {
						errorURL.searchParams.set("error", "session_create_failed");
						throw ctx.redirect(errorURL.toString());
					}

					const sessionExpiresAt = new Date(
						Date.now() + delegationSessionSeconds * 1000,
					);

					await opts.prisma.session.update({
						where: { id: session.id },
						data: {
							activeOrganizationId: parsed.organizationId,
							expiresAt: sessionExpiresAt,
						},
					});

					await setSessionCookie(
						ctx,
						{
							session: {
								...session,
								activeOrganizationId: parsed.organizationId,
								expiresAt: sessionExpiresAt,
							},
							user,
						},
						undefined,
						{ maxAge: delegationSessionSeconds },
					);

					throw ctx.redirect(parsed.callbackURL);
				},
			),
		},
	};
}

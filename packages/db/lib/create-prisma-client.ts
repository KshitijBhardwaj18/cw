import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@repo/db";

/**
 * Prisma 7+ requires a driver adapter. Use in scripts (seeds, one-offs) with `DATABASE_URL` loaded.
 */
export function createPrismaClient(): PrismaClient {
	const connectionString = process.env.DATABASE_URL?.trim();
	if (!connectionString) {
		throw new Error(
			"DATABASE_URL is missing. Create apps/server/.env (see apps/server/.env.example) or export DATABASE_URL.",
		);
	}

	const adapter = new PrismaPg({
		connectionString,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	return new PrismaClient({
		adapter,
		log: ["warn", "error"],
	});
}

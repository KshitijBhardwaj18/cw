import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@repo/db";
import { config } from "./config.js";

export async function createPrismaClient(): Promise<PrismaClient> {
	const adapter = new PrismaPg({
		connectionString: config.urls.db,
		ssl:
			config.environment === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	const prisma = new PrismaClient({
		adapter,
		log: ["error", "warn"],
	});

	await prisma.$connect();
	return prisma;
}

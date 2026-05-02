import { createPrismaClient } from "../lib/create-prisma-client";
import { seedBillingDemo } from "./seed-billing";

const prisma = createPrismaClient();

async function run() {
	console.log("Seeding billing data...");
	await seedBillingDemo(prisma);
	console.log("Billing seed complete.");
}

run()
	.catch((error) => {
		console.error("Billing seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

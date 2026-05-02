import {
	cancel,
	confirm,
	intro,
	isCancel,
	outro,
	select,
	spinner,
} from "@clack/prompts";
import { createPrismaClient } from "../lib/create-prisma-client";
import { cleanupAdmin, seedAdmin } from "./admin";
import { getOrganizationDataset } from "./dataset/organization";
import { cleanupOrganization, seedOrganization } from "./organization";

const prisma = createPrismaClient();

async function main() {
	intro("Seed Data Management TUI");

	let targetOrgId = "";
	let targetOrgName = "";

	const initialAction = await select({
		message: "What would you like to do?",
		options: [
			{ value: "seed-test", label: "Seed Test Organization" },
			{ value: "select", label: "Select Existing Organization" },
		],
	});

	if (isCancel(initialAction)) {
		cancel("Operation cancelled.");
		return;
	}

	if (initialAction === "seed-test") {
		const orgData = getOrganizationDataset();
		targetOrgId = orgData.id;
		targetOrgName = orgData.name;
	} else {
		const orgs = await prisma.organization.findMany({
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		});

		if (orgs.length === 0) {
			cancel("No organizations found in database.");
			return;
		}

		const selectedOrg = await select({
			message: "Select an organization:",
			options: orgs.map((org) => ({ value: org.id, label: org.name })),
		});

		if (isCancel(selectedOrg)) {
			cancel("Operation cancelled.");
			return;
		}

		targetOrgId = selectedOrg as string;
		targetOrgName = orgs.find((o) => o.id === targetOrgId)?.name || "";

		const confirmTarget = await confirm({
			message: `You selected ${targetOrgName}. Proceed with this organization?`,
			initialValue: false,
		});

		if (!confirmTarget || isCancel(confirmTarget)) {
			cancel("Operation cancelled.");
			return;
		}
	}

	const shouldCleanup = await confirm({
		message: `Delete existing seed data for ${targetOrgName}? This cannot be undone.`,
		initialValue: true,
	});

	if (isCancel(shouldCleanup)) {
		cancel("Operation cancelled.");
		return;
	}

	const shouldSeed = await confirm({
		message: `Proceed with seeding data for ${targetOrgName}?`,
		initialValue: true,
	});

	if (isCancel(shouldSeed)) {
		cancel("Operation cancelled.");
		return;
	}

	const s = spinner();

	if (shouldCleanup) {
		s.start(`Cleaning up existing seed data for ${targetOrgName}...`);
		await cleanupOrganization(prisma, targetOrgId);
		await cleanupAdmin(prisma, targetOrgId);
		s.stop("Cleanup complete.");
	}

	if (shouldSeed) {
		s.start(`Seeding Admin Portal data for ${targetOrgName}...`);
		await seedAdmin(prisma, targetOrgId);
		s.stop("Admin Portal seeding complete.");

		s.start(`Seeding Organization Portal data for ${targetOrgName}...`);
		await seedOrganization(prisma, targetOrgId);
		s.stop("Organization Portal seeding complete.");
	}

	outro("Done!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

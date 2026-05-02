import { createPrismaClient } from "../lib/create-prisma-client";
import { seedBillingDemo } from "./seed-billing";
import {
	seedOrgPlacementsDemo,
	seedVendorOnboardingWindowDemo,
} from "./seed-org-placements-demo";
import { seedOrgSubmissionsDemo } from "./seed-org-submissions-demo";
import { seedTimekeepingDemo } from "./seed-timekeeping-demo";
import { seedVendorJobsBoard } from "./seed-vendor-jobs-board";
import { seedVendorPerDiemShifts } from "./seed-vendor-per-diem-shifts";
import {
	SEED_VENDOR_PORTAL_USER_EMAIL,
	SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY,
	seedSecondaryVendorPortalUser,
	seedVendorPortalUser,
} from "./seed-vendor-portal-user";

const prisma = createPrismaClient();
const seedAdminEmail = "nilesh@heizen.work";

async function run() {
	console.log("Seeding demo data...");
	await seedBillingDemo(prisma);
	await seedOrgSubmissionsDemo(prisma, { seedAdminEmail });
	await seedVendorJobsBoard(prisma);
	await seedVendorPortalUser(prisma);
	await seedSecondaryVendorPortalUser(prisma);
	await seedOrgPlacementsDemo(prisma, { seedAdminEmail });
	await seedVendorOnboardingWindowDemo(prisma, { seedAdminEmail });
	await seedVendorPerDiemShifts(prisma);
	await seedTimekeepingDemo(prisma, { seedAdminEmail });

	console.log("");
	console.log("Demo accounts:");
	console.log(
		`  • Vendor portal (primary org): ${SEED_VENDOR_PORTAL_USER_EMAIL}`,
	);
	console.log(
		`  • Vendor portal (2nd org): ${SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY}`,
	);
	console.log(
		"  • Candidate portal: seed.submissions.accepted@example.invalid",
	);
	console.log("Demo seed complete.");
}

run()
	.catch((error) => {
		console.error("Demo seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

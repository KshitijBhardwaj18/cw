/**
 * Ensures a VendorUser exists so vendor portal (/vendor/placements) can sign in and
 * resolve organizationId via organizationVendor. Idempotent.
 */
import type { PrismaClient } from "@repo/db";
import {
	OrganizationIndustry,
	OrganizationVendorStatus,
	UserRole,
	UserStatus,
	VendorUserRole,
} from "@repo/db";

const SEED_VENDOR_INTERNAL_ID = "seed-vendor-submissions-demo";
const SECONDARY_VENDOR_INTERNAL_ID = "seed-vendor-secondary-org";

/** Stable dev login identity — set password via your Better Auth flow or admin tooling. */
export const SEED_VENDOR_PORTAL_USER_EMAIL =
	"seed.vendor.manager@example.invalid";

/**
 * Second org vendor portal login — uses a **dedicated vendor** linked only to the 2nd org in DB
 * so `getVendorContext` resolves that org (first ACTIVE link by `createdAt`).
 */
export const SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY =
	"seed.vendor.manager.sub@example.invalid";

export async function seedVendorPortalUser(
	prisma: PrismaClient,
): Promise<void> {
	const vendor =
		(await prisma.vendor.findUnique({
			where: { internalId: SEED_VENDOR_INTERNAL_ID },
			select: { id: true, name: true },
		})) ??
		(await prisma.vendor.findFirst({
			where: {
				organizationVendors: {
					some: { status: OrganizationVendorStatus.ACTIVE },
				},
			},
			select: { id: true, name: true },
		}));

	if (!vendor) {
		console.log(
			"seedVendorPortalUser: skipped — no vendor with an active organization link (run submissions seed first)",
		);
		return;
	}

	const link = await prisma.organizationVendor.findFirst({
		where: { vendorId: vendor.id, status: OrganizationVendorStatus.ACTIVE },
		select: { organizationId: true },
	});
	if (!link) {
		console.log(
			"seedVendorPortalUser: skipped — vendor has no ACTIVE organizationVendor row",
		);
		return;
	}

	const user = await prisma.user.upsert({
		where: { email: SEED_VENDOR_PORTAL_USER_EMAIL },
		create: {
			email: SEED_VENDOR_PORTAL_USER_EMAIL,
			name: `Seed Vendor Manager (${vendor.name})`,
			role: UserRole.VENDOR_USER,
			emailVerified: true,
			phoneNumber: "(555) 010-2030",
			title: "Clinical Recruiting",
			status: UserStatus.ACTIVE,
		},
		update: {
			name: `Seed Vendor Manager (${vendor.name})`,
			role: UserRole.VENDOR_USER,
			title: "Clinical Recruiting",
			status: UserStatus.ACTIVE,
		},
	});

	await prisma.vendorUser.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			vendorId: vendor.id,
			role: VendorUserRole.VENDOR_MANAGER,
		},
		update: {
			vendorId: vendor.id,
			role: VendorUserRole.VENDOR_MANAGER,
		},
	});

	console.log(
		`seedVendorPortalUser: vendor=${vendor.id} org=${link.organizationId} — sign in as ${SEED_VENDOR_PORTAL_USER_EMAIL} (vendor portal)`,
	);
}

/**
 * When there are at least two organizations, ensures a second vendor user whose vendor is linked
 * **only** to the second org (by `createdAt` order). Idempotent.
 */
export async function seedSecondaryVendorPortalUser(
	prisma: PrismaClient,
): Promise<void> {
	const organizations = await prisma.organization.findMany({
		select: { id: true, slug: true, name: true },
		orderBy: { createdAt: "asc" },
	});

	if (organizations.length < 2) {
		console.log(
			"seedSecondaryVendorPortalUser: skipped — fewer than 2 organizations",
		);
		return;
	}

	const secondaryOrg = organizations[1];

	const vendor = await prisma.vendor.upsert({
		where: { internalId: SECONDARY_VENDOR_INTERNAL_ID },
		create: {
			name: `Seed Staffing (Secondary — ${secondaryOrg.name})`,
			internalId: SECONDARY_VENDOR_INTERNAL_ID,
			industries: [OrganizationIndustry.HEALTHCARE],
		},
		update: {
			name: `Seed Staffing (Secondary — ${secondaryOrg.name})`,
		},
	});

	const existingLink = await prisma.organizationVendor.findFirst({
		where: {
			organizationId: secondaryOrg.id,
			vendorId: vendor.id,
		},
		select: { id: true },
	});
	if (existingLink) {
		await prisma.organizationVendor.update({
			where: { id: existingLink.id },
			data: { status: OrganizationVendorStatus.ACTIVE },
		});
	} else {
		await prisma.organizationVendor.create({
			data: {
				organizationId: secondaryOrg.id,
				vendorId: vendor.id,
				status: OrganizationVendorStatus.ACTIVE,
			},
		});
	}

	const user = await prisma.user.upsert({
		where: { email: SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY },
		create: {
			email: SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY,
			name: `Seed Vendor Manager — ${secondaryOrg.name}`,
			role: UserRole.VENDOR_USER,
			emailVerified: true,
			phoneNumber: "(555) 010-2031",
			title: "Clinical Recruiting",
			status: UserStatus.ACTIVE,
		},
		update: {
			name: `Seed Vendor Manager — ${secondaryOrg.name}`,
			role: UserRole.VENDOR_USER,
			title: "Clinical Recruiting",
			status: UserStatus.ACTIVE,
		},
	});

	await prisma.vendorUser.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			vendorId: vendor.id,
			role: VendorUserRole.VENDOR_MANAGER,
		},
		update: {
			vendorId: vendor.id,
			role: VendorUserRole.VENDOR_MANAGER,
		},
	});

	console.log(
		`seedSecondaryVendorPortalUser: vendor=${vendor.id} org=${secondaryOrg.id} (${secondaryOrg.slug ?? secondaryOrg.name}) — sign in as ${SEED_VENDOR_PORTAL_USER_EMAIL_SECONDARY}`,
	);
}

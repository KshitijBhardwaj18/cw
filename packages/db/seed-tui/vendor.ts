import type { PrismaClient } from "@repo/db";
import { OCCUPATION_ID } from "./dataset/occupations";
import { getUsersDataset } from "./dataset/users";
import { getVendorsDataset } from "./dataset/vendors";
import { SEED_PREFIX } from "./utils";

export async function cleanupVendor(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		await tx.invoiceLineItem.deleteMany({
			where: { invoice: { organizationId: orgId } },
		});
		await tx.submissionInterviewer.deleteMany({
			where: { submission: { organizationId: orgId } },
		});
		await tx.vendorOccupationSpecialization.deleteMany({
			where: { vendor: { internalId: { startsWith: SEED_PREFIX } } },
		});

		await tx.invoice.deleteMany({ where: { organizationId: orgId } });
		await tx.submission.deleteMany({ where: { organizationId: orgId } });

		await tx.vendorUser.deleteMany({
			where: { vendor: { internalId: { startsWith: SEED_PREFIX } } },
		});
		await tx.organizationVendor.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.vendor.deleteMany({
			where: { internalId: { startsWith: SEED_PREFIX } },
		});
	});
}

export async function seedVendor(prisma: PrismaClient, orgId: string) {
	const vendorsData = getVendorsDataset();
	const vendorsMap: Record<string, string> = {};

	for (const v of vendorsData) {
		const { orgVendor, specializations, address, ...vendorData } = v;

		let addressId: string | undefined;
		if (address) {
			const addr = await prisma.address.create({
				data: address,
			});
			addressId = addr.id;
		}

		const vendor = await prisma.vendor.upsert({
			where: { internalId: v.internalId },
			update: { ...vendorData, addressId },
			create: { ...vendorData, addressId, id: v.id, internalId: v.internalId },
		});
		vendorsMap[v.id] = vendor.id;

		await prisma.organizationVendor.upsert({
			where: {
				org_vendor_unique: {
					organizationId: orgId,
					vendorId: vendor.id,
				},
			},
			update: orgVendor,
			create: {
				...orgVendor,
				organizationId: orgId,
				vendorId: vendor.id,
			},
		});

		if (specializations) {
			for (const occAcronym of specializations) {
				const occId = OCCUPATION_ID[occAcronym];
				if (occId) {
					await prisma.vendorOccupationSpecialization.upsert({
						where: {
							vendor_occupation_unique: {
								vendorId: vendor.id,
								occupationId: occId,
							},
						},
						update: {},
						create: {
							vendorId: vendor.id,
							occupationId: occId,
						},
					});
				}
			}
		}
	}

	const { users } = getUsersDataset();
	for (const userData of users) {
		const { vendorAssociations } = userData;

		if (vendorAssociations) {
			for (const va of vendorAssociations) {
				const vendorId = vendorsMap[va.vendorId];
				if (vendorId) {
					await prisma.vendorUser.upsert({
						where: { userId: userData.id },
						update: {
							vendorId,
							role: va.role,
						},
						create: {
							userId: userData.id,
							vendorId,
							role: va.role,
						},
					});
				}
			}
		}
	}
}

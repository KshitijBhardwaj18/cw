import type { PrismaClient } from "@repo/db";
import { getComplianceDataset } from "./dataset/compliance";
import { getMatchingLogicDataset } from "./dataset/matching-logic";
import { getMetricsDataset } from "./dataset/metrics";
import { getMSPDataset } from "./dataset/msp";
import { getOccupationsDataset } from "./dataset/occupations";
import { getOrganizationDataset } from "./dataset/organization";
import { getSpecialtiesDataset } from "./dataset/specialties";
import { getTagsDataset } from "./dataset/tags";
import { getUsersDataset } from "./dataset/users";
import {
	getDeterministicId,
	SAMPLE_PDF_URL,
	SEED_EMAIL_DOMAIN,
	SEED_PREFIX,
} from "./utils";

export async function cleanupAdmin(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		const metricsDataset = getMetricsDataset();
		await tx.metric.deleteMany({
			where: { key: { in: metricsDataset.map((m) => m.key) } },
		});

		await tx.specialty.deleteMany({
			where: { id: { in: getSpecialtiesDataset().map((s) => s.id) } },
		});
		await tx.occupation.deleteMany({
			where: { id: { in: getOccupationsDataset().map((o) => o.id) } },
		});

		await tx.tag.deleteMany({
			where: { id: { in: getTagsDataset().map((t) => t.id) } },
		});
		await tx.complianceListItem.deleteMany({
			where: { id: { in: getComplianceDataset().map((c) => c.id) } },
		});

		const mspData = getMSPDataset();
		await tx.mSP.deleteMany({
			where: { id: { in: mspData.map((m) => m.id) } },
		});
		await tx.address.deleteMany({
			where: { id: { in: mspData.map((m) => m.addressId) } },
		});

		await tx.user.deleteMany({
			where: { email: { endsWith: SEED_EMAIL_DOMAIN } },
		});
		await tx.organization.deleteMany({
			where: { id: orgId },
		});
	});
}

export async function seedAdmin(prisma: PrismaClient, targetOrgId?: string) {
	const occupations = getOccupationsDataset();
	for (const occ of occupations) {
		await prisma.occupation.upsert({
			where: { id: occ.id },
			update: occ,
			create: occ,
		});
	}

	const specialties = getSpecialtiesDataset();
	for (const spec of specialties) {
		const { linkedOccupations, ...specData } = spec;
		await prisma.specialty.upsert({
			where: { id: spec.id },
			update: specData,
			create: specData,
		});

		for (const occAcronym of linkedOccupations) {
			const occ = occupations.find((o) => o.acronym === occAcronym);
			if (occ) {
				await prisma.occupationSpecialty.upsert({
					where: {
						occupationId_specialtyId: {
							occupationId: occ.id,
							specialtyId: spec.id,
						},
					},
					update: {},
					create: {
						occupationId: occ.id,
						specialtyId: spec.id,
					},
				});
			}
		}
	}

	const orgData = getOrganizationDataset();
	const orgId = targetOrgId || orgData.id;

	await prisma.organization.upsert({
		where: { id: orgId },
		update: orgData,
		create: { ...orgData, id: orgId },
	});

	const { users } = getUsersDataset();
	for (const userData of users) {
		const { orgMember, vendorAssociations, isApprover, ...u } = userData;

		await prisma.user.upsert({
			where: { email: userData.email },
			update: u,
			create: { ...u, id: userData.id },
		});
	}

	const tags = getTagsDataset();
	for (const tag of tags) {
		await prisma.tag.upsert({
			where: { id: tag.id },
			update: tag,
			create: tag,
		});
	}

	const complianceItems = getComplianceDataset();
	for (const item of complianceItems) {
		await prisma.complianceListItem.upsert({
			where: { id: item.id },
			update: item,
			create: item,
		});
	}

	const mspDataset = getMSPDataset();
	const allOrgs = await prisma.organization.findMany({
		select: { id: true },
	});

	for (const mData of mspDataset) {
		const { address, documents, notes, links, addressId, ...m } = mData;

		await prisma.address.upsert({
			where: { id: addressId },
			update: address,
			create: { id: addressId, ...address },
		});

		const { id, ...updateData } = m;

		const msp = await prisma.mSP.upsert({
			where: { id },
			update: { ...updateData, headquartersId: addressId },
			create: { id, ...updateData, headquartersId: addressId },
		});

		const firstUser = getUsersDataset().users[0];
		const firstUserId = firstUser.id;

		if (documents) {
			for (const doc of documents) {
				const docId = getDeterministicId(
					`${SEED_PREFIX}msp-doc-${id}-${doc.name}`,
				);
				await prisma.document.upsert({
					where: { id: docId },
					update: { ...doc, mspId: msp.id, uploadedBy: firstUserId },
					create: { id: docId, ...doc, mspId: msp.id, uploadedBy: firstUserId },
				});
			}
		}

		if (notes) {
			for (const note of notes) {
				const noteId = getDeterministicId(
					`${SEED_PREFIX}msp-note-${id}-${note.notes.substring(0, 10)}`,
				);
				await prisma.note.upsert({
					where: { id: noteId },
					update: { ...note, mspId: msp.id, createdBy: firstUserId },
					create: {
						id: noteId,
						...note,
						mspId: msp.id,
						createdBy: firstUserId,
					},
				});
			}
		}

		if (allOrgs.length > 0) {
			const randomOrgs = allOrgs
				.sort(() => 0.5 - Math.random())
				.slice(0, Math.floor(Math.random() * 3) + 1);

			for (const org of randomOrgs) {
				const linkData = links?.[0] || {
					mspFeePercentage: 5,
					saasFeePercentage: 2,
					startDate: new Date(),
					renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
					addendumAgreement: SAMPLE_PDF_URL,
				};

				await prisma.mSPLinkedOrg.upsert({
					where: {
						msp_org_unique: {
							mspId: msp.id,
							organizationId: org.id,
						},
					},
					update: {},
					create: {
						mspId: msp.id,
						organizationId: org.id,
						mspFeePercentage: linkData.mspFeePercentage,
						saasFeePercentage: linkData.saasFeePercentage,
						startDate: linkData.startDate,
						renewalDate: linkData.renewalDate,
						addendumAgreement: SAMPLE_PDF_URL,
					},
				});
			}
		}
	}

	const metricsDataset = getMetricsDataset();
	for (const mData of metricsDataset) {
		const { goal, currentValue, snapshots, isImproving, ...metricData } = mData;

		await prisma.metric.upsert({
			where: { key: metricData.key },
			update: metricData,
			create: metricData,
		});
	}

	const matchingCriteria = getMatchingLogicDataset();
	for (const item of matchingCriteria) {
		const criterion = await prisma.matchingCriterion.upsert({
			where: { key: item.key },
			update: {
				name: item.name,
				description: item.description,
			},
			create: {
				key: item.key,
				name: item.name,
				description: item.description,
			},
		});

		await prisma.matchingLogic.upsert({
			where: {
				organizationId_matchingCriterionId: {
					organizationId: orgId,
					matchingCriterionId: criterion.id,
				},
			},
			update: {
				active: item.active,
				weight: item.weight,
			},
			create: {
				organizationId: orgId,
				matchingCriterionId: criterion.id,
				active: item.active,
				weight: item.weight,
			},
		});
	}
}

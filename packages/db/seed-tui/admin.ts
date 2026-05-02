import type { PrismaClient } from "@repo/db";
import { getCandidatesDataset } from "./dataset/candidates";
import { getComplianceDataset } from "./dataset/compliance";
import { getComplianceChecklistsDataset } from "./dataset/compliance-checklists";
import { getComplianceWalletsDataset } from "./dataset/compliance-wallets";
import { DEPT_ID, getDepartmentsDataset } from "./dataset/departments";
import { getDocumentsDataset } from "./dataset/documents";
import { getLocationsDataset } from "./dataset/locations";
import { getMatchingLogicDataset } from "./dataset/matching-logic";
import { getMetricsDataset } from "./dataset/metrics";
import { getMSPDataset } from "./dataset/msp";
import { getNotesDataset } from "./dataset/notes";
import {
	getOccupationsDataset,
	getOrgOccIds,
	OCCUPATION_ID,
} from "./dataset/occupations";
import { getOrganizationDataset } from "./dataset/organization";
import { getPayCodesDataset } from "./dataset/pay-codes";
import { getQuestionnairesDataset } from "./dataset/questionnaires";
import { getRequisitionsDataset } from "./dataset/requisitions";
import { getOrgSpecIds, getSpecialtiesDataset } from "./dataset/specialties";
import { getTaggingRulesDataset } from "./dataset/tagging-rules";
import { getTagsDataset } from "./dataset/tags";
import { getUsersDataset } from "./dataset/users";
import { getVendorsDataset } from "./dataset/vendors";
import {
	getDeterministicId,
	SAMPLE_PDF_URL,
	SEED_EMAIL_DOMAIN,
	SEED_PREFIX,
} from "./utils";

export async function cleanupAdmin(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		// Level 1: Deep Children (Leaves)
		await tx.departmentTimekeepingApprover.deleteMany({
			where: { department: { organizationId: orgId } },
		});
		await tx.vendorOccupationSpecialization.deleteMany({
			where: { vendor: { internalId: { startsWith: SEED_PREFIX } } },
		});

		// Level 2: Infrastructure Configuration
		await tx.taggingRuleQuestion.deleteMany({
			where: { taggingRule: { organizationId: orgId } },
		});
		await tx.taggingRule.deleteMany({ where: { organizationId: orgId } });
		await tx.question.deleteMany({
			where: { questionnaire: { organizationId: orgId } },
		});
		await tx.questionnaire.deleteMany({ where: { organizationId: orgId } });
		await tx.matchingLogic.deleteMany({ where: { organizationId: orgId } });

		// Level 3: Organization Structure
		await tx.requisition.deleteMany({ where: { organizationId: orgId } });
		await tx.department.deleteMany({ where: { organizationId: orgId } });
		await tx.organizationLocation.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationVendor.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationSpecialty.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationOccupation.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationPayCode.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.candidate.deleteMany({
			where: {
				OR: [
					{ organizationId: orgId },
					{ id: { in: getCandidatesDataset().map((c) => c.id) } },
				],
			},
		});

		// Level 4: Global Seed Data (Filtered by Dataset IDs)
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

		await tx.complianceChecklistItem.deleteMany({
			where: { checklist: { organizationId: orgId } },
		});
		await tx.complianceChecklist.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.requisitionAcceptanceCriterion.deleteMany({
			where: { requisition: { organizationId: orgId } },
		});

		await tx.complianceWalletTemplateItem.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.complianceWalletTemplate.deleteMany({
			where: { organizationId: orgId },
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

		// Level 5: Root Entities
		await tx.user.deleteMany({
			where: { email: { endsWith: SEED_EMAIL_DOMAIN } },
		});
		await tx.vendor.deleteMany({
			where: { internalId: { startsWith: SEED_PREFIX } },
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
	let org = await prisma.organization.findUnique({ where: { id: orgId } });

	if (!org) {
		org = await prisma.organization.create({
			data: { ...orgData, id: orgId },
		});
	}

	const locations = getLocationsDataset(org.id);
	for (const loc of locations) {
		await prisma.organizationLocation.upsert({
			where: { id: loc.id },
			update: loc,
			create: loc,
		});
	}

	const orgOccIds = getOrgOccIds(org.id);
	for (const occ of occupations) {
		await prisma.organizationOccupation.upsert({
			where: { id: orgOccIds[occ.acronym] },
			update: {},
			create: {
				id: orgOccIds[occ.acronym],
				organizationId: org.id,
				occupationId: occ.id,
			},
		});
	}

	const orgSpecIds = getOrgSpecIds(org.id);
	for (const spec of specialties) {
		const occAcronyms = spec.linkedOccupations || [];
		for (const occAcronym of occAcronyms) {
			const orgOccId = orgOccIds[occAcronym];
			if (!orgOccId) continue;

			const specId = orgSpecIds[occAcronym][spec.acronym];
			if (!specId) continue;

			await prisma.organizationSpecialty.upsert({
				where: { id: specId },
				update: {},
				create: {
					id: specId,
					organizationId: org.id,
					specialtyId: spec.id,
					organizationOccupationId: orgOccId,
				},
			});
		}
	}

	const departments = getDepartmentsDataset(org.id);
	for (const dept of departments) {
		await prisma.department.upsert({
			where: { id: dept.id },
			update: dept,
			create: dept,
		});
	}

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
			create: { ...vendorData, addressId },
		});
		vendorsMap[v.id] = vendor.id;

		await prisma.organizationVendor.upsert({
			where: {
				org_vendor_unique: {
					organizationId: org.id,
					vendorId: vendor.id,
				},
			},
			update: orgVendor,
			create: {
				...orgVendor,
				organizationId: org.id,
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
	const userIds: string[] = [];

	for (const userData of users) {
		const { orgMember, vendorAssociations, isApprover, ...u } = userData;
		const user = await prisma.user.upsert({
			where: { id: userData.id },
			update: u,
			create: u,
		});
		userIds.push(user.id);

		if (orgMember) {
			const { departmentIds, ...memberData } = orgMember;

			await prisma.member.upsert({
				where: {
					id: userData.id,
				},
				update: {
					...memberData,
					userId: user.id,
				},
				create: {
					id: userData.id,
					...memberData,
					userId: user.id,
					organizationId: org.id,
				},
			});

			if (departmentIds) {
				for (const departmentId of departmentIds) {
					await prisma.departmentUser.upsert({
						where: {
							departmentId_userId: {
								departmentId,
								userId: user.id,
							},
						},
						update: {},
						create: {
							departmentId,
							userId: user.id,
						},
					});
				}
			}
		}

		if (vendorAssociations) {
			for (const va of vendorAssociations) {
				const vendorId = vendorsMap[va.vendorId];
				if (vendorId) {
					await prisma.vendorUser.upsert({
						where: { userId: user.id },
						update: {
							vendorId,
							role: va.role,
						},
						create: {
							userId: user.id,
							vendorId,
							role: va.role,
						},
					});
				}
			}
		}

		if (isApprover) {
			const orDeptId = DEPT_ID.OR;
			if (orDeptId) {
				await prisma.departmentTimekeepingApprover.upsert({
					where: {
						departmentId_userId: {
							departmentId: orDeptId,
							userId: user.id,
						},
					},
					update: {},
					create: {
						departmentId: orDeptId,
						userId: user.id,
					},
				});
			}
		}
	}

	const docs = getDocumentsDataset(org.id, userIds);
	for (const doc of docs) {
		await prisma.document.upsert({
			where: { id: doc.id },
			update: doc,
			create: doc,
		});
	}

	const notes = getNotesDataset(org.id, userIds);
	for (const note of notes) {
		await prisma.note.upsert({
			where: { id: note.id },
			update: note,
			create: note,
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

	const wallets = getComplianceWalletsDataset();
	for (const wallet of wallets) {
		const { itemIds, occupationAcronym, specialtyAcronym, ...walletData } =
			wallet;

		const organizationOccupationId = orgOccIds[occupationAcronym];
		if (!organizationOccupationId) continue;

		const organizationSpecialtyId = specialtyAcronym
			? orgSpecIds[occupationAcronym][specialtyAcronym]
			: null;

		await prisma.complianceWalletTemplate.upsert({
			where: { id: wallet.id },
			update: {
				...walletData,
				organizationId: org.id,
				organizationOccupationId,
				organizationSpecialtyId,
			},
			create: {
				...walletData,
				organizationId: org.id,
				organizationOccupationId,
				organizationSpecialtyId,
			},
		});

		await prisma.complianceWalletTemplateItem.deleteMany({
			where: { complianceWalletTemplateId: wallet.id },
		});

		for (const itemId of itemIds) {
			await prisma.complianceWalletTemplateItem.create({
				data: {
					organizationId: org.id,
					complianceWalletTemplateId: wallet.id,
					complianceListItemId: itemId,
				},
			});
		}
	}

	const questionnaires = getQuestionnairesDataset();
	const questionMap: Record<string, string> = {};
	for (const qData of questionnaires) {
		const { questions, occupationAcronym, specialtyAcronym, ...q } = qData;

		const occupationId = occupationAcronym
			? orgOccIds[occupationAcronym]
			: null;
		const specialtyId =
			specialtyAcronym && occupationAcronym
				? orgSpecIds[occupationAcronym]?.[specialtyAcronym]
				: null;

		const questionnaire = await prisma.questionnaire.upsert({
			where: { id: q.id },
			update: {
				...q,
				organizationId: org.id,
				occupationId,
				specialtyId,
			},
			create: {
				...q,
				organizationId: org.id,
				occupationId,
				specialtyId,
			},
		});

		for (const quest of questions) {
			const question = await prisma.question.upsert({
				where: { id: quest.id },
				update: {
					...quest,
					questionnaireId: questionnaire.id,
				},
				create: {
					...quest,
					questionnaireId: questionnaire.id,
				},
			});
			questionMap[quest.id] = question.id;
		}
	}

	const tagsMap: Record<string, string> = {};
	for (const tag of tags) {
		tagsMap[tag.name] = tag.id;
	}

	const taggingRules = getTaggingRulesDataset();
	for (const rule of taggingRules) {
		const { questions, ...ruleData } = rule;

		const taggingRule = await prisma.taggingRule.upsert({
			where: { id: rule.id },
			update: {
				...ruleData,
				organizationId: org.id,
			},
			create: {
				...ruleData,
				organizationId: org.id,
			},
		});

		await prisma.taggingRuleQuestion.deleteMany({
			where: { taggingRuleId: taggingRule.id },
		});

		for (const rq of questions) {
			await prisma.taggingRuleQuestion.create({
				data: {
					taggingRuleId: taggingRule.id,
					questionId: rq.questionId,
					condition: rq.condition,
					triggerValue: rq.triggerValue,
				},
			});
		}
	}

	const metricsDataset = getMetricsDataset();
	for (const mData of metricsDataset) {
		const { goal, currentValue, snapshots, isImproving, ...metricData } = mData;

		const metric = await prisma.metric.upsert({
			where: { key: metricData.key },
			update: metricData,
			create: metricData,
		});

		await prisma.organizationMetric.upsert({
			where: {
				organizationId_metricId: {
					organizationId: org.id,
					metricId: metric.id,
				},
			},
			update: { goal, isActive: true },
			create: {
				organizationId: org.id,
				metricId: metric.id,
				goal,
				isActive: true,
			},
		});

		for (const snapshot of snapshots) {
			await prisma.organizationMetricSnapshot.upsert({
				where: { id: snapshot.id },
				update: {
					...snapshot,
					organizationId: org.id,
					metricId: metric.id,
					computedAt: new Date(),
				},
				create: {
					...snapshot,
					organizationId: org.id,
					metricId: metric.id,
					computedAt: new Date(),
				},
			});
		}
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
					organizationId: org.id,
					matchingCriterionId: criterion.id,
				},
			},
			update: {
				weight: item.weight,
				active: item.active,
			},
			create: {
				organizationId: org.id,
				matchingCriterionId: criterion.id,
				weight: item.weight,
				active: item.active,
			},
		});
	}

	const candidates = getCandidatesDataset();
	for (const cand of candidates) {
		const { specialtyIds, ...candData } = cand;
		await prisma.candidate.upsert({
			where: { id: cand.id },
			update: { ...candData, organizationId: org.id },
			create: { ...candData, organizationId: org.id },
		});

		if (specialtyIds?.length) {
			for (const specId of specialtyIds) {
				await prisma.candidateSpecialty.upsert({
					where: {
						candidateId_specialtyId: {
							candidateId: cand.id,
							specialtyId: specId,
						},
					},
					update: {},
					create: {
						candidateId: cand.id,
						specialtyId: specId,
					},
				});
			}
		}
	}

	const checklists = getComplianceChecklistsDataset(org.id);
	for (const checklist of checklists) {
		const { itemIds, ...checklistData } = checklist;
		await prisma.complianceChecklist.upsert({
			where: { id: checklist.id },
			update: checklistData,
			create: checklistData,
		});

		for (const itemId of itemIds) {
			await prisma.complianceChecklistItem.upsert({
				where: {
					checklistId_complianceListItemId: {
						checklistId: checklist.id,
						complianceListItemId: itemId,
					},
				},
				update: {},
				create: {
					checklistId: checklist.id,
					complianceListItemId: itemId,
				},
			});
		}
	}

	const requisitions = getRequisitionsDataset(org.id);
	for (const req of requisitions) {
		await prisma.requisition.upsert({
			where: { id: req.id },
			update: req,
			create: req,
		});
	}

	const payCodes = getPayCodesDataset(org.id);
	for (const pc of payCodes) {
		await prisma.organizationPayCode.upsert({
			where: { id: pc.id },
			update: pc,
			create: pc,
		});
	}
}

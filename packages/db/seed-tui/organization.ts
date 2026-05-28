import type { PrismaClient } from "@repo/db";
import {
	getBillingConfigDataset,
	getWorkforceBillingRatesDataset,
} from "./dataset/billing";
import { getComplianceChecklistsDataset } from "./dataset/compliance-checklists";
import { DEPT_ID, getDepartmentsDataset } from "./dataset/departments";
import { getHolidaysDataset } from "./dataset/holidays";
import { getLocationsDataset, LOCATION_ID } from "./dataset/locations";
import { getMetricsDataset } from "./dataset/metrics";
import {
	getOccupationsDataset,
	getOrgOccIds,
	OCCUPATION_ID,
} from "./dataset/occupations";
import { getShiftRoutingSettingsDataset } from "./dataset/organization";
import { getPayCodesDataset } from "./dataset/pay-codes";
import { getProjectsDataset, PROJECT_ID } from "./dataset/projects";
import { getQuestionnairesDataset } from "./dataset/questionnaires";
import { getRequisitionTemplatesDataset } from "./dataset/requisition-templates";
import { getRequisitionsDataset, REQUISITION_ID } from "./dataset/requisitions";
import { getShiftTemplatesDataset } from "./dataset/shift-templates";
import { getOrgSpecIds, getSpecialtiesDataset } from "./dataset/specialties";
import { getTaggingRulesDataset } from "./dataset/tagging-rules";
import { getUsersDataset } from "./dataset/users";
import { VENDOR_ID } from "./dataset/vendors";

export async function cleanupOrganization(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		await tx.requisitionTemplateVendor.deleteMany({
			where: { template: { organizationId: orgId } },
		});
		await tx.requisitionTemplate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.requisition.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.shiftTemplate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.project.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.shiftRoutingSettings.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.taggingRuleQuestion.deleteMany({
			where: { taggingRule: { organizationId: orgId } },
		});
		await tx.taggingRule.deleteMany({ where: { organizationId: orgId } });
		await tx.question.deleteMany({
			where: { questionnaire: { organizationId: orgId } },
		});
		await tx.questionnaire.deleteMany({ where: { organizationId: orgId } });
		await tx.matchingLogic.deleteMany({ where: { organizationId: orgId } });

		await tx.organizationHoliday.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationWorkforceBillingRate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.billingConfig.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.complianceChecklistItem.deleteMany({
			where: { checklist: { organizationId: orgId } },
		});
		await tx.complianceChecklist.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.organizationMetricSnapshot.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationMetric.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.departmentUser.deleteMany({
			where: { department: { organizationId: orgId } },
		});
		await tx.departmentTimekeepingApprover.deleteMany({
			where: { department: { organizationId: orgId } },
		});
		await tx.departmentOccupation.deleteMany({
			where: { department: { organizationId: orgId } },
		});
		await tx.departmentSpecialty.deleteMany({
			where: { department: { organizationId: orgId } },
		});
		await tx.department.deleteMany({ where: { organizationId: orgId } });
		await tx.organizationLocation.deleteMany({
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

		await tx.member.deleteMany({ where: { organizationId: orgId } });
	});
}

export async function seedOrganization(prisma: PrismaClient, orgId: string) {
	const locations = getLocationsDataset(orgId);
	for (const loc of locations) {
		await prisma.organizationLocation.upsert({
			where: { id: loc.id },
			update: loc,
			create: loc,
		});
	}

	const occupations = getOccupationsDataset();
	const orgOccIds = getOrgOccIds(orgId);
	for (const occ of occupations) {
		await prisma.organizationOccupation.upsert({
			where: { id: orgOccIds[occ.acronym] },
			update: {},
			create: {
				id: orgOccIds[occ.acronym],
				organizationId: orgId,
				occupationId: occ.id,
			},
		});
	}

	const specialties = getSpecialtiesDataset();
	const orgSpecIds = getOrgSpecIds(orgId);
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
					organizationId: orgId,
					specialtyId: spec.id,
					organizationOccupationId: orgOccId,
				},
			});
		}
	}

	const departments = getDepartmentsDataset(orgId);
	for (const dept of departments) {
		const { organizationOccupationId, organizationSpecialtyId, ...deptData } =
			dept;

		await prisma.department.upsert({
			where: { id: dept.id },
			update: deptData,
			create: deptData,
		});

		if (organizationOccupationId) {
			await prisma.departmentOccupation.upsert({
				where: {
					departmentId_organizationOccupationId: {
						departmentId: dept.id,
						organizationOccupationId,
					},
				},
				update: {},
				create: {
					departmentId: dept.id,
					organizationOccupationId,
				},
			});
		}

		if (organizationSpecialtyId) {
			await prisma.departmentSpecialty.upsert({
				where: {
					departmentId_organizationSpecialtyId: {
						departmentId: dept.id,
						organizationSpecialtyId,
					},
				},
				update: {},
				create: {
					departmentId: dept.id,
					organizationSpecialtyId,
				},
			});
		}
	}

	const payCodes = getPayCodesDataset(orgId);
	for (const pc of payCodes) {
		await prisma.organizationPayCode.upsert({
			where: { id: pc.id },
			update: pc,
			create: pc,
		});
	}

	const questionnaires = getQuestionnairesDataset();
	for (const q of questionnaires) {
		const { questions, occupationAcronym, specialtyAcronym, ...qData } = q;
		const organizationOccupationId = occupationAcronym
			? orgOccIds[occupationAcronym]
			: null;
		const organizationSpecialtyId =
			specialtyAcronym && occupationAcronym
				? orgSpecIds[occupationAcronym][specialtyAcronym]
				: specialtyAcronym
					? orgSpecIds.RN[specialtyAcronym]
					: null;

		await prisma.questionnaire.upsert({
			where: { id: q.id },
			update: {
				...qData,
				organizationId: orgId,
				occupationId: organizationOccupationId,
				specialtyId: organizationSpecialtyId,
			},
			create: {
				...qData,
				id: q.id,
				organizationId: orgId,
				occupationId: organizationOccupationId,
				specialtyId: organizationSpecialtyId,
			},
		});

		for (const question of questions) {
			await prisma.question.upsert({
				where: { id: question.id },
				update: { ...question, questionnaireId: q.id },
				create: { ...question, questionnaireId: q.id },
			});
		}
	}

	const { users } = getUsersDataset();
	for (const userData of users) {
		const { orgMember, isApprover } = userData;

		if (orgMember) {
			const { departmentIds, ...memberData } = orgMember;

			await prisma.member.upsert({
				where: { id: userData.id },
				update: { ...memberData, userId: userData.id },
				create: {
					id: userData.id,
					...memberData,
					userId: userData.id,
					organizationId: orgId,
				},
			});

			if (departmentIds) {
				for (const departmentId of departmentIds) {
					await prisma.departmentUser.upsert({
						where: {
							departmentId_userId: {
								departmentId,
								userId: userData.id,
							},
						},
						update: {},
						create: {
							departmentId,
							userId: userData.id,
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
							userId: userData.id,
						},
					},
					update: {},
					create: {
						departmentId: orDeptId,
						userId: userData.id,
					},
				});
			}
		}
	}

	const billingConfig = getBillingConfigDataset(orgId);
	await prisma.billingConfig.upsert({
		where: { clientBillingId: billingConfig.clientBillingId },
		update: billingConfig,
		create: billingConfig,
	});

	const billingRates = getWorkforceBillingRatesDataset(orgId);
	for (const rate of billingRates) {
		await prisma.organizationWorkforceBillingRate.upsert({
			where: {
				organizationId_workforceType: {
					organizationId: orgId,
					workforceType: rate.workforceType,
				},
			},
			update: rate,
			create: rate,
		});
	}

	const holidays = getHolidaysDataset(orgId);
	for (const holiday of holidays) {
		await prisma.organizationHoliday.upsert({
			where: { id: holiday.id },
			update: holiday,
			create: holiday,
		});
	}

	const checklists = getComplianceChecklistsDataset(orgId);
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

	const projects = getProjectsDataset(orgId);
	for (const project of projects) {
		await prisma.project.upsert({
			where: { id: project.id },
			update: project,
			create: project,
		});
	}

	const requisitionTemplates = getRequisitionTemplatesDataset(orgId, {
		locationId: LOCATION_ID.MAIN,
		departmentId: DEPT_ID.CARDIO,
	});
	for (const template of requisitionTemplates) {
		await prisma.requisitionTemplate.upsert({
			where: { id: template.id },
			update: template,
			create: template,
		});

		const vendorsToLink = [
			VENDOR_ID.MEDSTAFF,
			VENDOR_ID.CAREFIRST,
			VENDOR_ID.ELITE,
		];
		for (const vendorId of vendorsToLink) {
			await prisma.requisitionTemplateVendor.upsert({
				where: {
					templateId_vendorId: {
						templateId: template.id,
						vendorId,
					},
				},
				update: {
					templateId: template.id,
					vendorId,
				},
				create: {
					templateId: template.id,
					vendorId,
				},
			});
		}
	}

	const requisitions = getRequisitionsDataset(orgId);
	for (const reqData of requisitions) {
		const { organizationSpecialtyIds, ...reqScalar } = reqData;
		const req = await prisma.requisition.upsert({
			where: { id: reqScalar.id },
			update: reqScalar,
			create: reqScalar,
		});
		await prisma.requisitionSpecialty.deleteMany({
			where: { requisitionId: req.id },
		});
		if (organizationSpecialtyIds.length > 0) {
			await prisma.requisitionSpecialty.createMany({
				data: organizationSpecialtyIds.map((organizationSpecialtyId) => ({
					requisitionId: req.id,
					organizationSpecialtyId,
				})),
				skipDuplicates: true,
			});
		}

		const globalVendors = [
			VENDOR_ID.MEDSTAFF,
			VENDOR_ID.CAREFIRST,
			VENDOR_ID.ELITE,
		];
		for (const vId of globalVendors) {
			await prisma.requisitionVendor.upsert({
				where: {
					requisitionId_vendorId: {
						requisitionId: req.id,
						vendorId: vId,
					},
				},
				update: {
					requisitionId: req.id,
					vendorId: vId,
				},
				create: {
					requisitionId: req.id,
					vendorId: vId,
				},
			});
		}

		if (reqData.complianceChecklistId) {
			const checklist = checklists.find(
				(c) => c.id === reqData.complianceChecklistId,
			);
			if (checklist) {
				for (const itemId of checklist.itemIds) {
					await prisma.requisitionAcceptanceCriterion.upsert({
						where: {
							requisitionId_complianceListItemId: {
								requisitionId: req.id,
								complianceListItemId: itemId,
							},
						},
						update: {},
						create: {
							requisitionId: req.id,
							complianceListItemId: itemId,
						},
					});
				}
			}
		}
	}

	const requisitionLinks = [
		{ reqId: REQUISITION_ID.RADIO, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.ONCO, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.TELE, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.PEDS, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.MEDSURG, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.ED, projectId: PROJECT_ID.ED_STAFFING },
		{ reqId: REQUISITION_ID.ICU, projectId: PROJECT_ID.ICU_COVERAGE },
	];

	for (const link of requisitionLinks) {
		await prisma.requisition.update({
			where: { id: link.reqId },
			data: { projectId: link.projectId },
		});
	}

	const shiftTemplates = getShiftTemplatesDataset(orgId);
	for (const template of shiftTemplates) {
		const { occupationAcronym, ...templateData } = template;
		await prisma.shiftTemplate.upsert({
			where: { id: template.id },
			update: {
				...templateData,
				organizationId: orgId,
				occupationId: OCCUPATION_ID[occupationAcronym],
			},
			create: {
				...templateData,
				organizationId: orgId,
				occupationId: OCCUPATION_ID[occupationAcronym],
			},
		});
	}

	const taggingRules = getTaggingRulesDataset();
	for (const rule of taggingRules) {
		const { questions, ...ruleData } = rule;

		const taggingRule = await prisma.taggingRule.upsert({
			where: { id: rule.id },
			update: { ...ruleData, organizationId: orgId },
			create: { ...ruleData, organizationId: orgId },
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
		const { goal, snapshots } = mData;

		const metric = await prisma.metric.findUnique({
			where: { key: mData.key },
		});
		if (!metric) continue;

		await prisma.organizationMetric.upsert({
			where: {
				organizationId_metricId: {
					organizationId: orgId,
					metricId: metric.id,
				},
			},
			update: { goal, isActive: true },
			create: {
				organizationId: orgId,
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
					organizationId: orgId,
					metricId: metric.id,
					computedAt: new Date(),
				},
				create: {
					...snapshot,
					organizationId: orgId,
					metricId: metric.id,
					computedAt: new Date(),
				},
			});
		}
	}

	const routingSettings = getShiftRoutingSettingsDataset(orgId);
	await prisma.shiftRoutingSettings.upsert({
		where: { organizationId: orgId },
		update: routingSettings,
		create: routingSettings,
	});
}

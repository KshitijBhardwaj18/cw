import type { PrismaClient } from "@repo/db";
import {
	CandidateComplianceStatus,
	MissingTimeCaseStatus,
	PlacementComplianceStatus,
	TimesheetEntryStatus,
} from "@repo/db";
import {
	getBillingConfigDataset,
	getWorkforceBillingRatesDataset,
} from "./dataset/billing";
import { getCandidateCredentialsDataset } from "./dataset/candidate-credentials";
import { getCandidateTagsDataset } from "./dataset/candidate-tags";
import { DEPT_ID } from "./dataset/departments";
import { getGrievancesDataset } from "./dataset/grievances";
import { getHolidaysDataset } from "./dataset/holidays";
import { getInvoicesDataset } from "./dataset/invoices";
import { LOCATION_ID } from "./dataset/locations";
import { getMetricsDataset } from "./dataset/metrics";
import { getMissingTimeDataset } from "./dataset/missing-time";
import { OCCUPATION_ID } from "./dataset/occupations";
import {
	getPlacementExtrasDataset,
	PLACEMENT_CANDIDATE_MAP,
} from "./dataset/placement-extras";
import { getPlacementsDataset } from "./dataset/placements";
import { getProjectsDataset, PROJECT_ID } from "./dataset/projects";
import { getRequisitionTemplatesDataset } from "./dataset/requisition-templates";
import { REQUISITION_ID } from "./dataset/requisitions";
import { getShiftTemplatesDataset } from "./dataset/shift-templates";
import { getShiftsDataset } from "./dataset/shifts";
import { getSpendAnalyticsDataset } from "./dataset/spend-analytics";
import { getSubmissionsDataset } from "./dataset/submissions";
import { getTimekeepingDataset } from "./dataset/timekeeping";
import { USER_ID } from "./dataset/users";
import { VENDOR_ID } from "./dataset/vendors";
import { getWorkforceListsDataset } from "./dataset/workforce-lists";

export async function cleanupOrganization(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		// Level 1: Deep Children (Leaves)
		await tx.grievanceTask.deleteMany({
			where: { grievance: { organizationId: orgId } },
		});
		await tx.timesheetDispute.deleteMany({
			where: { timesheet: { organizationId: orgId } },
		});
		await tx.timesheetEntry.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.invoiceLineItem.deleteMany({
			where: { invoice: { organizationId: orgId } },
		});
		await tx.perDiemAssignment.deleteMany({
			where: { shift: { organizationId: orgId } },
		});
		await tx.candidateCompliance.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
		await tx.credentialExpirySummary.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.placementComplianceItem.deleteMany({
			where: { placement: { organizationId: orgId } },
		});
		await tx.placementNote.deleteMany({
			where: { placement: { organizationId: orgId } },
		});
		await tx.placementTask.deleteMany({
			where: { placement: { organizationId: orgId } },
		});
		await tx.placementOfferHistory.deleteMany({
			where: { placement: { organizationId: orgId } },
		});

		// Level 2: Core Transactional Entities
		await tx.grievance.deleteMany({ where: { organizationId: orgId } });
		await tx.invoice.deleteMany({ where: { organizationId: orgId } });
		await tx.timesheet.deleteMany({ where: { organizationId: orgId } });
		await tx.placementSummary.deleteMany({ where: { organizationId: orgId } });
		await tx.placement.deleteMany({ where: { organizationId: orgId } });
		await tx.submission.deleteMany({ where: { organizationId: orgId } });
		await tx.perDiemShift.deleteMany({ where: { organizationId: orgId } });
		await tx.missingTimeCase.deleteMany({ where: { organizationId: orgId } });
		await tx.spendAnalytics.deleteMany({ where: { organizationId: orgId } });
		await tx.timekeepingSummary.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationMetricSnapshot.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationMetric.deleteMany({
			where: { organizationId: orgId },
		});

		// Level 3: Templates & Projects
		await tx.requisitionTemplateVendor.deleteMany({
			where: { template: { organizationId: orgId } },
		});
		await tx.requisitionTemplate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.shiftTemplate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.project.deleteMany({
			where: { organizationId: orgId },
		});
		// Level 4: Core Configuration
		await tx.organizationHoliday.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.organizationWorkforceBillingRate.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.billingConfig.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.workforceListMember.deleteMany({
			where: { list: { organizationId: orgId } },
		});
		await tx.workforceList.deleteMany({ where: { organizationId: orgId } });
		// Level 5: Core Identity (Handled by Admin seeder mostly, but some here)
		await tx.candidateTag.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
	});
}

export async function seedOrganization(prisma: PrismaClient, orgId: string) {
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

	const submissions = getSubmissionsDataset(orgId);
	for (const s of submissions) {
		const item = s as ReturnType<typeof getSubmissionsDataset>[number] & {
			interviewers?: string[];
		};
		const {
			interviewers,
			candidateId,
			requisitionId,
			organizationId,
			vendorId,
			submittedByUserId,
			...submissionData
		} = item;

		await prisma.submission.upsert({
			where: { id: s.id },
			update: {
				...submissionData,
				candidateId,
				requisitionId,
				organizationId,
				vendorId,
			},
			create: {
				...submissionData,
				id: s.id,
				candidateId,
				requisitionId,
				organizationId,
				vendorId,
				submittedByUserId: submittedByUserId || undefined,
				createdBy: USER_ID.ALICE,
			},
		});

		if (interviewers) {
			for (const userId of interviewers) {
				await prisma.submissionInterviewer.upsert({
					where: {
						submissionId_userId: {
							submissionId: s.id,
							userId,
						},
					},
					update: {},
					create: {
						submissionId: s.id,
						userId,
					},
				});
			}
		}
	}

	const placementsData = getPlacementsDataset(orgId);
	for (const p of placementsData) {
		const {
			submissionId,
			candidateId,
			requisitionId,
			organizationId,
			vendorId,
			...placementData
		} = p;

		await prisma.placement.upsert({
			where: { id: p.id },
			update: {
				...placementData,
				submissionId,
				candidateId,
				requisitionId,
				organizationId,
				vendorId,
			},
			create: {
				...placementData,
				id: p.id,
				submissionId,
				candidateId,
				requisitionId,
				organizationId,
				vendorId,
				createdBy: USER_ID.ALICE,
			},
		});
	}

	const projects = getProjectsDataset(orgId);
	for (const project of projects) {
		await prisma.project.upsert({
			where: { id: project.id },
			update: project,
			create: project,
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

	const shifts = getShiftsDataset(orgId);
	for (const shift of shifts) {
		const { assignments, ...shiftData } = shift;
		await prisma.perDiemShift.upsert({
			where: { id: shift.id },
			update: shiftData,
			create: shiftData,
		});

		if (assignments) {
			for (const assignment of assignments) {
				await prisma.perDiemAssignment.upsert({
					where: {
						shiftId_candidateId: {
							shiftId: shift.id,
							candidateId: assignment.candidateId,
						},
					},
					update: assignment,
					create: {
						...assignment,
						shiftId: shift.id,
					},
				});
			}
		}
	}

	const templates = getRequisitionTemplatesDataset(orgId, {
		locationId: LOCATION_ID.MAIN,
		departmentId: DEPT_ID.CARDIO,
	});

	for (const template of templates) {
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
				update: {},
				create: {
					templateId: template.id,
					vendorId,
				},
			});
		}
	}

	const requisitionLinks = [
		{ reqId: REQUISITION_ID.ICU, projectId: PROJECT_ID.ED_STAFFING },
		{ reqId: REQUISITION_ID.ED, projectId: PROJECT_ID.ED_STAFFING },
		{ reqId: REQUISITION_ID.PEDS, projectId: PROJECT_ID.ED_STAFFING },
		{ reqId: REQUISITION_ID.TELE, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.RADIO, projectId: PROJECT_ID.NURSING_EXPANSION },
		{ reqId: REQUISITION_ID.ONCO, projectId: PROJECT_ID.NURSING_EXPANSION },
	];

	for (const link of requisitionLinks) {
		await prisma.requisition.update({
			where: { id: link.reqId },
			data: { projectId: link.projectId },
		});
	}

	const { complianceItems, notes, tasks, offerHistory } =
		getPlacementExtrasDataset(orgId);

	const { candidateCompliance: allCandidateCompliance, credentialSummaries } =
		getCandidateCredentialsDataset(orgId);

	const candidateIds = Array.from(
		new Set(PLACEMENT_CANDIDATE_MAP.map((entry) => entry.candidateId)),
	);
	if (candidateIds.length > 0) {
		await prisma.candidateCompliance.deleteMany({
			where: { candidateId: { in: candidateIds } },
		});
	}

	for (const cc of allCandidateCompliance) {
		await prisma.candidateCompliance.upsert({
			where: {
				candidateId_complianceListItemId: {
					candidateId: cc.candidateId,
					complianceListItemId: cc.complianceListItemId,
				},
			},
			update: cc,
			create: cc,
		});
	}

	for (const cs of credentialSummaries) {
		await prisma.credentialExpirySummary.upsert({
			where: {
				placementId_complianceListItemId: {
					placementId: cs.placementId,
					complianceListItemId: cs.complianceListItemId,
				},
			},
			update: cs,
			create: cs,
		});
	}

	for (const pci of complianceItems) {
		await prisma.placementComplianceItem.upsert({
			where: { id: pci.id },
			update: pci,
			create: pci,
		});
	}

	for (const note of notes) {
		await prisma.placementNote.upsert({
			where: { id: note.id },
			update: note,
			create: note,
		});
	}

	for (const task of tasks) {
		await prisma.placementTask.upsert({
			where: { id: task.id },
			update: task,
			create: task,
		});
	}

	for (const history of offerHistory) {
		await prisma.placementOfferHistory.upsert({
			where: { id: history.id },
			update: history,
			create: history,
		});
	}

	for (const placement of getPlacementsDataset(orgId)) {
		const items = complianceItems.filter((i) => i.placementId === placement.id);

		const total = items.length;
		const approved = allCandidateCompliance.filter(
			(cc) =>
				cc.candidateId === placement.candidateId &&
				items.some((i) => i.complianceListItemId === cc.complianceListItemId) &&
				cc.status === CandidateComplianceStatus.APPROVED,
		).length;

		await prisma.placementSummary.upsert({
			where: { placementId: placement.id },
			update: {
				status: placement.status,
				complianceStatus:
					total === approved
						? PlacementComplianceStatus.COMPLETE
						: approved < 5 && total > 0
							? PlacementComplianceStatus.MISSING
							: PlacementComplianceStatus.IN_PROGRESS,
				complianceProgressTotal: total,
				complianceProgressCompleted: approved,
			},
			create: {
				placementId: placement.id,
				organizationId: orgId,
				candidateId: placement.candidateId,
				requisitionId: placement.requisitionId,
				status: placement.status,
				vendorId: placement.vendorId,
				complianceStatus:
					total === approved
						? PlacementComplianceStatus.COMPLETE
						: approved < 5 && total > 0
							? PlacementComplianceStatus.MISSING
							: PlacementComplianceStatus.IN_PROGRESS,
				complianceProgressTotal: total,
				complianceProgressCompleted: approved,
			},
		});
	}

	const payCodes = await prisma.organizationPayCode.findMany({
		where: { organizationId: orgId },
	});
	const payCodeMap: Record<string, string> = {};
	for (const pc of payCodes) {
		payCodeMap[pc.code] = pc.id;
	}

	const { timesheets: timekeepingData, summary } = getTimekeepingDataset(orgId);
	for (const ts of timekeepingData) {
		const { entries, status: summaryStatus, dispute, ...tsData } = ts;

		const timesheet = await prisma.timesheet.upsert({
			where: { id: tsData.id },
			update: tsData,
			create: tsData,
		});

		await prisma.timesheetEntry.deleteMany({
			where: { timesheetId: timesheet.id },
		});

		const entryIds: string[] = [];
		for (const entry of entries) {
			const workDate = new Date(entry.date);
			const payCodeId = entry.payCode
				? payCodeMap[entry.payCode]
				: payCodeMap.REG;
			const overtimeHours = entry.overtimeHours || 0;
			const regularHours = entry.hours - overtimeHours;

			const created = await prisma.timesheetEntry.create({
				data: {
					timesheetId: timesheet.id,
					organizationId: orgId,
					candidateId: tsData.candidateId,
					placementId: tsData.placementId,
					locationId: tsData.locationId,
					departmentId: tsData.departmentId,
					workDate,
					clockIn: entry.clockIn,
					clockOut: entry.clockOut,
					breakMinutes: entry.breakMinutes,
					regularHours,
					overtimeHours,
					hours: entry.hours,
					status: summaryStatus,
					dataSource: entry.dataSource,
					payCodeId: payCodeId || (payCodes[0]?.id as string),
				},
			});
			entryIds.push(created.id);
		}

		if (summaryStatus === TimesheetEntryStatus.DISPUTED && ts.dispute) {
			const disputeId = ts.dispute.id;
			await prisma.timesheetDispute.upsert({
				where: { id: disputeId },
				update: {},
				create: {
					id: disputeId,
					timesheetId: timesheet.id,
					timesheetEntryId: entryIds[ts.dispute.entryIdIndex],
					description: ts.dispute.description,
					raisedById: ts.dispute.raisedByUserId,
					raisedAt: new Date(),
					resolution: ts.dispute.resolution,
					resolutionCategory: ts.dispute.resolutionCategory,
					resolvedAt: ts.dispute.resolvedAt,
					resolvedById: ts.dispute.resolvedById,
				},
			});
		}
	}

	await prisma.timekeepingSummary.upsert({
		where: { id: summary.id },
		update: summary,
		create: summary,
	});

	const missingCases = getMissingTimeDataset(orgId);
	const workforceLists = getWorkforceListsDataset(orgId);
	for (const list of workforceLists) {
		const { members, ...listData } = list;
		await prisma.workforceList.upsert({
			where: { id: list.id },
			update: listData,
			create: listData,
		});

		for (const member of members) {
			await prisma.workforceListMember.upsert({
				where: {
					listId_candidateId: {
						listId: list.id,
						candidateId: member.candidateId,
					},
				},
				update: {},
				create: {
					listId: list.id,
					candidateId: member.candidateId,
				},
			});
		}
	}

	const candidateTags = getCandidateTagsDataset();
	for (const ct of candidateTags) {
		for (const tagId of ct.tagIds) {
			await prisma.candidateTag.upsert({
				where: {
					candidateId_tagId: {
						candidateId: ct.candidateId,
						tagId: tagId,
					},
				},
				update: {},
				create: {
					candidateId: ct.candidateId,
					tagId: tagId,
				},
			});
		}
	}

	for (const mc of missingCases) {
		await prisma.missingTimeCase.upsert({
			where: { id: mc.id },
			update: mc,
			create: mc,
		});
	}

	const missingTimeCasesOpen = missingCases.filter(
		(mc) =>
			mc.status === MissingTimeCaseStatus.OPEN ||
			mc.status === MissingTimeCaseStatus.REMINDED,
	).length;
	const missingTimeCasesOverdue = missingCases.filter(
		(mc) =>
			(mc.status === MissingTimeCaseStatus.OPEN ||
				mc.status === MissingTimeCaseStatus.REMINDED) &&
			(mc.daysOverdue ?? 0) > 3,
	).length;
	const missingTimeCasesResolved = missingCases.filter(
		(mc) => mc.status === MissingTimeCaseStatus.RESOLVED,
	).length;

	await prisma.timekeepingSummary.update({
		where: { id: summary.id },
		data: {
			missingTimeCasesOpen,
			missingTimeCasesOverdue,
			missingTimeCasesResolved,
		},
	});

	const invoices = getInvoicesDataset(orgId);
	for (const inv of invoices) {
		const { lineItems, ...invData } = inv;
		await prisma.invoice.upsert({
			where: { id: inv.id },
			update: invData,
			create: invData,
		});

		for (const li of lineItems) {
			const amount = li.amount ?? li.quantity * li.unitPrice;
			await prisma.invoiceLineItem.upsert({
				where: { id: li.id },
				update: { ...li, amount, invoiceId: inv.id },
				create: { ...li, amount, invoiceId: inv.id },
			});
		}
	}

	const spendAnalytics = getSpendAnalyticsDataset(orgId);
	for (const sa of spendAnalytics) {
		await prisma.spendAnalytics.upsert({
			where: { id: sa.id },
			update: sa,
			create: sa,
		});
	}

	const grievances = getGrievancesDataset(orgId);
	for (const g of grievances) {
		const { tasks, ...grievanceData } = g;
		await prisma.grievance.upsert({
			where: { id: g.id },
			update: grievanceData,
			create: grievanceData,
		});

		if (tasks) {
			for (const task of tasks) {
				await prisma.grievanceTask.upsert({
					where: { id: task.id },
					update: task,
					create: {
						...task,
						grievanceId: g.id,
						createdById: g.createdById,
					},
				});
			}
		}
	}

	const performanceMetrics = getMetricsDataset();
	for (const m of performanceMetrics) {
		const { snapshots, isImproving, ...metricData } = m;
		await prisma.organizationMetric.upsert({
			where: {
				organizationId_metricId: {
					organizationId: orgId,
					metricId: metricData.id,
				},
			},
			update: {
				goal: metricData.goal,
				isActive: true,
			},
			create: {
				organizationId: orgId,
				metricId: metricData.id,
				goal: metricData.goal,
				isActive: true,
			},
		});

		for (const snapshot of snapshots) {
			await prisma.organizationMetricSnapshot.upsert({
				where: { id: snapshot.id },
				update: {
					...snapshot,
					organizationId: orgId,
					metricId: metricData.id,
				},
				create: {
					...snapshot,
					organizationId: orgId,
					metricId: metricData.id,
				},
			});
		}
	}
}

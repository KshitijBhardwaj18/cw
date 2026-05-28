import type { PrismaClient } from "@repo/db";
import {
	CandidateComplianceStatus,
	MissingTimeCaseStatus,
	PlacementComplianceStatus,
	TimesheetEntryStatus,
} from "@repo/db";
import { getCandidateCredentialsDataset } from "./dataset/candidate-credentials";
import { getCandidateSummariesDataset } from "./dataset/candidate-summaries";
import { getCandidateTagsDataset } from "./dataset/candidate-tags";
import { getCandidatesDataset } from "./dataset/candidates";
import { getComplianceWalletsDataset } from "./dataset/compliance-wallets";
import { getDocumentsDataset } from "./dataset/documents";
import { getGrievancesDataset } from "./dataset/grievances";
import { getInvoicesDataset } from "./dataset/invoices";
import { getMissingTimeDataset } from "./dataset/missing-time";
import { getNotesDataset } from "./dataset/notes";
import { getOrgOccIds } from "./dataset/occupations";
import { getPlacementExtrasDataset } from "./dataset/placement-extras";
import { getPlacementsDataset } from "./dataset/placements";
import { getSavedRequisitionsDataset } from "./dataset/saved-requisitions";
import { getShiftsDataset } from "./dataset/shifts";
import { getOrgSpecIds } from "./dataset/specialties";
import { getSubmissionsDataset } from "./dataset/submissions";
import { getTimekeepingDataset } from "./dataset/timekeeping";
import { getUsersDataset, USER_ID } from "./dataset/users";
import { getWorkforceListsDataset } from "./dataset/workforce-lists";

export async function cleanupCandidate(prisma: PrismaClient, orgId: string) {
	await prisma.$transaction(async (tx) => {
		await tx.grievanceTask.deleteMany({
			where: { grievance: { organizationId: orgId } },
		});
		await tx.timesheetDispute.deleteMany({
			where: { timesheet: { organizationId: orgId } },
		});
		await tx.timesheetEntry.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.perDiemAssignment.deleteMany({
			where: { shift: { organizationId: orgId } },
		});
		await tx.perDiemShiftSpecialty.deleteMany({
			where: { shift: { organizationId: orgId } },
		});
		await tx.candidateProfessionalReference.deleteMany({
			where: { candidate: { organizationId: orgId } },
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

		await tx.grievance.deleteMany({ where: { organizationId: orgId } });
		await tx.timesheet.deleteMany({ where: { organizationId: orgId } });
		await tx.placementSummary.deleteMany({ where: { organizationId: orgId } });
		await tx.candidateSummary.deleteMany({ where: { organizationId: orgId } });
		await tx.placement.deleteMany({ where: { organizationId: orgId } });
		await tx.submissionInterviewer.deleteMany({
			where: { submission: { organizationId: orgId } },
		});
		await tx.submission.deleteMany({ where: { organizationId: orgId } });
		await tx.perDiemShift.deleteMany({ where: { organizationId: orgId } });
		await tx.missingTimeCase.deleteMany({ where: { organizationId: orgId } });
		await tx.timekeepingSummary.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.candidateSavedRequisition.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
		await tx.candidateTag.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
		await tx.candidateSpecialty.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
		await tx.candidatePreferredLocation.deleteMany({
			where: { candidate: { organizationId: orgId } },
		});
		await tx.note.deleteMany({ where: { organizationId: orgId } });
		await tx.document.deleteMany({ where: { organizationId: orgId } });
		await tx.candidate.deleteMany({
			where: {
				OR: [
					{ organizationId: orgId },
					{ id: { in: getCandidatesDataset().map((c) => c.id) } },
				],
			},
		});

		await tx.complianceWalletTemplateItem.deleteMany({
			where: { organizationId: orgId },
		});
		await tx.complianceWalletTemplate.deleteMany({
			where: { organizationId: orgId },
		});

		await tx.workforceListMember.deleteMany({
			where: { list: { organizationId: orgId } },
		});
		await tx.workforceList.deleteMany({ where: { organizationId: orgId } });
	});
}

export async function seedCandidate(prisma: PrismaClient, orgId: string) {
	const candidates = getCandidatesDataset();
	for (const cand of candidates) {
		const {
			specialtyIds,
			preferredLocationIds,
			professionalReferences,
			...candData
		} = cand;

		await prisma.candidate.upsert({
			where: { id: cand.id },
			update: { ...candData, organizationId: orgId },
			create: { ...candData, organizationId: orgId },
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

		if (preferredLocationIds?.length) {
			for (const locId of preferredLocationIds) {
				await prisma.candidatePreferredLocation.upsert({
					where: {
						candidateId_locationId: {
							candidateId: cand.id,
							locationId: locId,
						},
					},
					update: {},
					create: {
						candidateId: cand.id,
						locationId: locId,
					},
				});
			}
		}

		if (professionalReferences?.length) {
			for (let i = 0; i < professionalReferences.length; i++) {
				const ref = professionalReferences[i];
				await prisma.candidateProfessionalReference.upsert({
					where: { id: ref.id },
					update: { ...ref, position: i },
					create: {
						...ref,
						candidateId: cand.id,
						position: i,
					},
				});
			}
		}
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

	const userIds = getUsersDataset().users.map((u) => u.id);
	const docs = getDocumentsDataset(orgId, userIds);
	for (const doc of docs) {
		await prisma.document.upsert({
			where: { id: doc.id },
			update: doc,
			create: doc,
		});
	}

	const notes = getNotesDataset(orgId, userIds);
	for (const note of notes) {
		await prisma.note.upsert({
			where: { id: note.id },
			update: note,
			create: note,
		});
	}

	const orgOccIds = getOrgOccIds(orgId);
	const orgSpecIds = getOrgSpecIds(orgId);
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
				organizationId: orgId,
				organizationOccupationId,
				organizationSpecialtyId,
			},
			create: {
				...walletData,
				organizationId: orgId,
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
					organizationId: orgId,
					complianceWalletTemplateId: wallet.id,
					complianceListItemId: itemId,
				},
			});
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

	const candidateSummaries = getCandidateSummariesDataset(orgId);
	for (const cs of candidateSummaries) {
		await prisma.candidateSummary.upsert({
			where: { candidateId: cs.candidateId },
			update: { ...cs, organizationId: orgId },
			create: { ...cs, organizationId: orgId },
		});
	}

	const {
		complianceItems: placementComplianceItems,
		notes: placementNotes,
		tasks: placementTasks,
		offerHistory,
	} = getPlacementExtrasDataset(orgId);

	const { candidateCompliance, credentialSummaries } =
		getCandidateCredentialsDataset(orgId);

	for (const cc of candidateCompliance) {
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

	for (const pci of placementComplianceItems) {
		await prisma.placementComplianceItem.upsert({
			where: { id: pci.id },
			update: pci,
			create: pci,
		});
	}

	for (const note of placementNotes) {
		await prisma.placementNote.upsert({
			where: { id: note.id },
			update: note,
			create: note,
		});
	}

	for (const task of placementTasks) {
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

	for (const placement of placementsData) {
		const items = placementComplianceItems.filter(
			(i) => i.placementId === placement.id,
		);
		const total = items.length;
		const approved = candidateCompliance.filter(
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

	const { timesheets, summary: timekeepingSummary } =
		getTimekeepingDataset(orgId);
	for (const ts of timesheets) {
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
					workDate: new Date(entry.date),
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

		if (summaryStatus === TimesheetEntryStatus.DISPUTED && dispute) {
			await prisma.timesheetDispute.upsert({
				where: { id: dispute.id },
				update: {},
				create: {
					id: dispute.id,
					timesheetId: timesheet.id,
					timesheetEntryId: entryIds[dispute.entryIdIndex],
					description: dispute.description,
					raisedById: dispute.raisedByUserId,
					raisedAt: new Date(),
					resolution: dispute.resolution,
					resolutionCategory: dispute.resolutionCategory,
					resolvedAt: dispute.resolvedAt,
					resolvedById: dispute.resolvedById,
				},
			});
		}
	}

	await prisma.timekeepingSummary.upsert({
		where: { id: timekeepingSummary.id },
		update: timekeepingSummary,
		create: timekeepingSummary,
	});

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

	const missingCases = getMissingTimeDataset(orgId);
	for (const mc of missingCases) {
		await prisma.missingTimeCase.upsert({
			where: { id: mc.id },
			update: { ...mc, organizationId: orgId },
			create: { ...mc, organizationId: orgId },
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
		where: { id: timekeepingSummary.id },
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

	const savedReqs = getSavedRequisitionsDataset();
	for (const sr of savedReqs) {
		await prisma.candidateSavedRequisition.upsert({
			where: {
				candidateId_requisitionId: {
					candidateId: sr.candidateId,
					requisitionId: sr.requisitionId,
				},
			},
			update: sr,
			create: sr,
		});
	}

	const shifts = getShiftsDataset(orgId);
	for (const shift of shifts) {
		const { assignments, specialtyIds, ...shiftData } = shift;
		await prisma.perDiemShift.upsert({
			where: { id: shift.id },
			update: shiftData,
			create: shiftData,
		});

		await prisma.perDiemShiftSpecialty.deleteMany({
			where: { shiftId: shift.id },
		});
		for (const specialtyId of specialtyIds) {
			await prisma.perDiemShiftSpecialty.create({
				data: {
					shiftId: shift.id,
					specialtyId,
				},
			});
		}

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
}

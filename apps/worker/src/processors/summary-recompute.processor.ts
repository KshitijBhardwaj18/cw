import {
	CandidateComplianceStatus,
	ComplianceListItemStatus,
	PlacementComplianceStatus,
	PlacementStatus,
	type Prisma,
	type PrismaClient,
	TimesheetEntryStatus,
} from "@repo/db";
import type { SummaryRecomputePayload } from "@repo/shared";

function deriveCredentialExpiryStatus(
	ccStatus: CandidateComplianceStatus,
	expiryDate: Date | null,
): "EXPIRED" | "CRITICAL" | "EXPIRING_SOON" {
	const now = Date.now();
	const sevenDays = 7 * 24 * 60 * 60 * 1000;
	const daysLeft = expiryDate
		? Math.ceil((expiryDate.getTime() - now) / (24 * 60 * 60 * 1000))
		: null;
	if (
		ccStatus === CandidateComplianceStatus.EXPIRED ||
		(daysLeft !== null && daysLeft <= 0)
	)
		return "EXPIRED";
	if (expiryDate && expiryDate.getTime() <= now + sevenDays) return "CRITICAL";
	return "EXPIRING_SOON";
}

export async function runSummaryRecomputeProcessor(
	prisma: PrismaClient,
	payload: SummaryRecomputePayload,
): Promise<void> {
	if (payload.kind === "candidate") {
		const candidate = await prisma.candidate.findUnique({
			where: { id: payload.candidateId },
			select: {
				id: true,
				organizationId: true,
				vendorId: true,
				occupationId: true,
				resumeUrl: true,
				avatarUrl: true,
				preferredShiftTypes: true,
				candidateSpecialties: { select: { specialtyId: true } },
				candidatePreferredLocations: { select: { locationId: true } },
			},
		});
		if (!candidate?.occupationId) return;

		const compliance = await prisma.candidateCompliance.findMany({
			where: { candidateId: candidate.id },
			select: { status: true, expiryDate: true },
		});

		const now = new Date();
		let completedComplianceItems = 0;
		let missingComplianceItems = 0;
		let expiredComplianceItems = 0;
		let expiringSoonComplianceItems = 0;
		let nextComplianceExpiryDate: Date | null = null;

		for (const row of compliance) {
			const expiry = row.expiryDate;
			const isExpired =
				row.status === CandidateComplianceStatus.EXPIRED ||
				(expiry != null && expiry <= now);
			const isApproved =
				row.status === CandidateComplianceStatus.APPROVED && !isExpired;

			if (isApproved) completedComplianceItems += 1;
			if (isExpired) expiredComplianceItems += 1;
			if (!isApproved && !isExpired) missingComplianceItems += 1;

			if (expiry != null && expiry > now) {
				const daysLeft =
					(expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
				if (daysLeft <= 30) expiringSoonComplianceItems += 1;
				if (
					!nextComplianceExpiryDate ||
					expiry.getTime() < nextComplianceExpiryDate.getTime()
				) {
					nextComplianceExpiryDate = expiry;
				}
			}
		}

		const totalSpecialties = candidate.candidateSpecialties.length;
		const totalPreferredLocations =
			candidate.candidatePreferredLocations.length;
		const hasResume = !!candidate.resumeUrl;
		const hasAvatar = !!candidate.avatarUrl;
		const hasCompletedProfile =
			totalSpecialties > 0 &&
			totalPreferredLocations > 0 &&
			candidate.preferredShiftTypes.length > 0 &&
			hasResume;

		const primarySpecialtyId =
			candidate.candidateSpecialties[0]?.specialtyId ?? null;

		// Wallet-template-only aggregates: compute from required template list items
		// (occupation + specialties), not from "all candidate_compliance rows".
		let walletTotalComplianceItems = 0;
		let walletApprovedComplianceItems = 0;
		let walletPendingUploadComplianceItems = 0;
		let walletPendingVerificationComplianceItems = 0;
		let walletExpiredComplianceItems = 0;
		let walletExpiringSoonComplianceItems = 0;
		let walletNextComplianceExpiryDate: Date | null = null;
		const walletNow = now;

		if (candidate.organizationId) {
			const orgOcc = await prisma.organizationOccupation.findFirst({
				where: {
					organizationId: candidate.organizationId,
					occupationId: candidate.occupationId,
				},
				select: { id: true },
			});

			if (orgOcc?.id) {
				const specialtyIds = candidate.candidateSpecialties.map(
					(s) => s.specialtyId,
				);
				const orgSpecs =
					specialtyIds.length > 0
						? await prisma.organizationSpecialty.findMany({
								where: {
									organizationId: candidate.organizationId,
									organizationOccupationId: orgOcc.id,
									specialtyId: { in: specialtyIds },
								},
								select: { id: true },
							})
						: [];
				const orgSpecIds = orgSpecs.map((s) => s.id);

				const templates = await prisma.complianceWalletTemplate.findMany({
					where: {
						organizationId: candidate.organizationId,
						organizationOccupationId: orgOcc.id,
						...(orgSpecIds.length > 0
							? {
									OR: [
										{ organizationSpecialtyId: null },
										{ organizationSpecialtyId: { in: orgSpecIds } },
									],
								}
							: { organizationSpecialtyId: null }),
					},
					select: {
						organizationSpecialtyId: true,
						complianceWalletTemplateItems: {
							select: {
								complianceListItem: {
									select: { id: true, status: true, displayToCandidate: true },
								},
							},
						},
					},
				});

				const specPkSet = new Set(orgSpecIds);
				const requiredItemIds = new Set<string>();
				for (const t of templates) {
					if (
						t.organizationSpecialtyId &&
						!specPkSet.has(t.organizationSpecialtyId)
					) {
						continue;
					}
					for (const wi of t.complianceWalletTemplateItems) {
						const li = wi.complianceListItem;
						if (
							li.status !== ComplianceListItemStatus.ACTIVE ||
							!li.displayToCandidate
						)
							continue;
						requiredItemIds.add(li.id);
					}
				}

				const ids = [...requiredItemIds];
				walletTotalComplianceItems = ids.length;

				if (ids.length > 0) {
					const ccRows = await prisma.candidateCompliance.findMany({
						where: {
							candidateId: candidate.id,
							complianceListItemId: { in: ids },
						},
						select: {
							complianceListItemId: true,
							status: true,
							expiryDate: true,
							documentUrl: true,
						},
					});
					const ccByItem = new Map<string, (typeof ccRows)[number]>();
					for (const r of ccRows) ccByItem.set(r.complianceListItemId, r);

					for (const itemId of ids) {
						const cc = ccByItem.get(itemId) ?? null;
						const hasDoc = !!cc?.documentUrl?.trim();
						const expiry = cc?.expiryDate ?? null;
						const isExpired =
							(expiry != null && expiry < walletNow) ||
							cc?.status === CandidateComplianceStatus.EXPIRED;

						if (!hasDoc) {
							walletPendingUploadComplianceItems += 1;
							continue;
						}
						if (isExpired) {
							walletExpiredComplianceItems += 1;
							continue;
						}
						if (cc?.status === CandidateComplianceStatus.APPROVED) {
							walletApprovedComplianceItems += 1;
						} else if (cc?.status === CandidateComplianceStatus.PENDING) {
							walletPendingVerificationComplianceItems += 1;
						} else {
							// MISSING with a document shouldn't happen, but treat as pending verification.
							walletPendingVerificationComplianceItems += 1;
						}

						if (expiry != null && expiry > walletNow) {
							const daysLeft =
								(expiry.getTime() - walletNow.getTime()) /
								(1000 * 60 * 60 * 24);
							if (daysLeft <= 30) walletExpiringSoonComplianceItems += 1;
							if (
								!walletNextComplianceExpiryDate ||
								expiry.getTime() < walletNextComplianceExpiryDate.getTime()
							) {
								walletNextComplianceExpiryDate = expiry;
							}
						}
					}
				}
			}
		}

		await prisma.candidateSummary.upsert({
			where: { candidateId: candidate.id },
			update: {
				organizationId: candidate.organizationId,
				vendorId: candidate.vendorId,
				occupationId: candidate.occupationId,
				primarySpecialtyId,
				totalSpecialties,
				totalPreferredLocations,
				hasResume,
				hasAvatar,
				hasCompletedProfile,
				isSubmissionReady: hasCompletedProfile,
				totalComplianceItems: compliance.length,
				completedComplianceItems,
				missingComplianceItems,
				expiredComplianceItems,
				expiringSoonComplianceItems,
				nextComplianceExpiryDate,
				lastComplianceUpdatedAt: now,
				walletTotalComplianceItems,
				walletApprovedComplianceItems,
				walletPendingUploadComplianceItems,
				walletPendingVerificationComplianceItems,
				walletExpiredComplianceItems,
				walletExpiringSoonComplianceItems,
				walletNextComplianceExpiryDate,
				walletLastComplianceUpdatedAt: now,
			},
			create: {
				candidateId: candidate.id,
				organizationId: candidate.organizationId,
				vendorId: candidate.vendorId,
				occupationId: candidate.occupationId,
				primarySpecialtyId,
				totalSpecialties,
				totalPreferredLocations,
				hasResume,
				hasAvatar,
				hasCompletedProfile,
				isSubmissionReady: hasCompletedProfile,
				totalComplianceItems: compliance.length,
				completedComplianceItems,
				missingComplianceItems,
				expiredComplianceItems,
				expiringSoonComplianceItems,
				nextComplianceExpiryDate,
				lastComplianceUpdatedAt: now,
				walletTotalComplianceItems,
				walletApprovedComplianceItems,
				walletPendingUploadComplianceItems,
				walletPendingVerificationComplianceItems,
				walletExpiredComplianceItems,
				walletExpiringSoonComplianceItems,
				walletNextComplianceExpiryDate,
				walletLastComplianceUpdatedAt: now,
			},
		});
		return;
	}

	if (payload.kind === "placement") {
		const placement = await prisma.placement.findUnique({
			where: { id: payload.placementId },
			select: {
				id: true,
				organizationId: true,
				vendorId: true,
				candidateId: true,
				requisitionId: true,
				status: true,
			},
		});
		if (!placement) return;

		const placementId = placement.id;
		const now = new Date();

		const required = await prisma.placementComplianceItem.findMany({
			where: { placementId, removedAt: null },
			select: {
				complianceListItemId: true,
				complianceListItem: { select: { name: true } },
			},
		});

		const requiredIds = required.map((r) => r.complianceListItemId);
		const total = requiredIds.length;

		const candidateCompliances =
			total > 0
				? await prisma.candidateCompliance.findMany({
						where: {
							candidateId: placement.candidateId,
							complianceListItemId: { in: requiredIds },
						},
						select: {
							complianceListItemId: true,
							status: true,
							expiryDate: true,
						},
					})
				: [];

		const ccByItem = new Map(
			candidateCompliances.map((cc) => [cc.complianceListItemId, cc]),
		);

		let completed = 0;
		let expiredItemsCount = 0;
		let expiringSoonItemsCount = 0;
		let nextComplianceExpiryDate: Date | null = null;
		const missingNames: string[] = [];
		const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

		for (const req of required) {
			const cc = ccByItem.get(req.complianceListItemId) ?? null;
			const expiry = cc?.expiryDate ?? null;
			const isExpired =
				cc?.status === CandidateComplianceStatus.EXPIRED ||
				(expiry != null && expiry <= now);
			const isApproved =
				cc?.status === CandidateComplianceStatus.APPROVED &&
				!isExpired &&
				(expiry == null || expiry > now);

			if (isApproved) {
				completed += 1;
			} else {
				missingNames.push(req.complianceListItem.name);
				if (isExpired) expiredItemsCount += 1;
				else if (expiry != null && expiry > now && expiry <= thirtyDaysAhead) {
					expiringSoonItemsCount += 1;
				}
			}
			if (expiry != null && expiry > now) {
				if (
					!nextComplianceExpiryDate ||
					expiry.getTime() < nextComplianceExpiryDate.getTime()
				) {
					nextComplianceExpiryDate = expiry;
				}
			}
		}

		let complianceStatus: PlacementComplianceStatus;
		if (total === 0) complianceStatus = PlacementComplianceStatus.COMPLETE;
		else if (completed >= total)
			complianceStatus = PlacementComplianceStatus.COMPLETE;
		else if (completed > 0)
			complianceStatus = PlacementComplianceStatus.IN_PROGRESS;
		else complianceStatus = PlacementComplianceStatus.MISSING;

		missingNames.sort((a, b) => a.localeCompare(b));
		const missingTotal = Math.max(0, total - completed);
		const missingItemsCount = missingTotal;
		const shown = missingNames.slice(0, 2);
		const rest = missingTotal - shown.length;
		const complianceMissingItemsPreview =
			missingTotal === 0 || shown.length === 0
				? null
				: rest > 0
					? `${shown.join(", ")} +${rest} more`
					: shown.join(", ");

		const [approvedHoursAgg, lastTimeEntry] = await Promise.all([
			prisma.timesheetEntry.aggregate({
				where: {
					placementId,
					organizationId: placement.organizationId,
					status: TimesheetEntryStatus.APPROVED,
				},
				_sum: {
					hours: true,
					regularHours: true,
					overtimeHours: true,
				},
			}),
			prisma.timesheetEntry.findFirst({
				where: { placementId, organizationId: placement.organizationId },
				orderBy: { workDate: "desc" },
				select: { workDate: true, status: true },
			}),
		]);
		const sumH = approvedHoursAgg._sum.hours ?? 0;
		const sumReg = approvedHoursAgg._sum.regularHours ?? 0;
		const sumOt = approvedHoursAgg._sum.overtimeHours ?? 0;
		const totalApprovedHours =
			sumH > 0
				? Math.round(sumH * 100) / 100
				: sumReg + sumOt > 0
					? Math.round((sumReg + sumOt) * 100) / 100
					: null;

		const placementSummaryData: Omit<
			Prisma.PlacementSummaryUncheckedCreateInput,
			"placementId"
		> = {
			organizationId: placement.organizationId,
			vendorId: placement.vendorId,
			candidateId: placement.candidateId,
			requisitionId: placement.requisitionId,
			status: placement.status,
			complianceStatus,
			complianceProgressCompleted: completed,
			complianceProgressTotal: total,
			complianceMissingItemsPreview,
			missingItemsCount,
			expiredItemsCount,
			expiringSoonItemsCount,
			nextComplianceExpiryDate,
			lastComplianceUpdatedAt: now,
			latestTimecardStatus: lastTimeEntry?.status ?? null,
			totalApprovedHours,
			lastTimeEntryDate: lastTimeEntry?.workDate ?? null,
		};

		await prisma.placementSummary.upsert({
			where: { placementId },
			update: placementSummaryData,
			create: {
				placementId,
				...placementSummaryData,
			},
		});

		if (placement.status === PlacementStatus.TERMINATED) {
			await prisma.credentialExpirySummary.deleteMany({
				where: { placementId },
			});
			return;
		}

		// Full rebuild: delete all credential rows for this placement, then insert
		// only rows that should exist now (fixes stale rows when status/expiry changes).
		await prisma.credentialExpirySummary.deleteMany({ where: { placementId } });

		if (requiredIds.length === 0) {
			return;
		}

		const thirty = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
		const ids = requiredIds;

		const expiringCompliance = await prisma.candidateCompliance.findMany({
			where: {
				candidateId: placement.candidateId,
				complianceListItemId: { in: ids },
				OR: [
					{ status: CandidateComplianceStatus.EXPIRED },
					{ expiryDate: { lte: thirty } },
				],
			},
			select: {
				complianceListItemId: true,
				status: true,
				expiryDate: true,
			},
		});

		const ccExpiryByItem = new Map(
			expiringCompliance.map((c) => [c.complianceListItemId, c]),
		);

		const details = await prisma.placement.findUnique({
			where: { id: placementId },
			select: {
				organizationId: true,
				vendorId: true,
				locationId: true,
				departmentId: true,
				hiringManagerId: true,
				jobTitle: true,
				requisition: { select: { jobTitle: true } },
				candidate: {
					select: {
						user: { select: { name: true } },
					},
				},
				vendor: { select: { name: true } },
				location: { select: { name: true } },
				department: { select: { name: true } },
				hiringManager: { select: { name: true } },
			},
		});

		if (!details) return;

		const workerName = details.candidate.user.name ?? "Unknown candidate";
		const jobTitle = details.jobTitle ?? details.requisition?.jobTitle ?? "—";

		const listItems = await prisma.complianceListItem.findMany({
			where: { id: { in: ids } },
			select: { id: true, name: true, category: true },
		});
		const itemById = new Map(listItems.map((i) => [i.id, i]));

		const credentialRows: Prisma.CredentialExpirySummaryCreateManyInput[] = [];

		for (const itemId of ids) {
			const cc = ccExpiryByItem.get(itemId);
			if (!cc) continue;
			const expiry = cc.expiryDate;
			if (cc.status !== CandidateComplianceStatus.EXPIRED && !expiry) continue;

			const item = itemById.get(itemId);
			if (!item) continue;

			const status = deriveCredentialExpiryStatus(cc.status, expiry);
			credentialRows.push({
				organizationId: details.organizationId,
				placementId,
				candidateId: placement.candidateId,
				complianceListItemId: itemId,
				status,
				expiryDate: expiry,
				workerName,
				credentialName: item.name,
				credentialCategory: item.category,
				credentialTypeLabel: item.category,
				jobTitle,
				requisitionJobTitle: details.requisition?.jobTitle ?? null,
				locationId: details.locationId,
				locationName: details.location?.name ?? null,
				departmentId: details.departmentId,
				departmentName: details.department?.name ?? null,
				vendorId: details.vendorId,
				vendorName: details.vendor?.name ?? null,
				hiringManagerId: details.hiringManagerId,
				hiringManagerName: details.hiringManager?.name ?? null,
			});
		}

		if (credentialRows.length > 0) {
			await prisma.credentialExpirySummary.createMany({
				data: credentialRows,
			});
		}

		return;
	}

	const weekEnd = new Date(payload.weekEndingDate);
	if (Number.isNaN(weekEnd.getTime())) return;

	const start = new Date(
		Date.UTC(
			weekEnd.getUTCFullYear(),
			weekEnd.getUTCMonth(),
			weekEnd.getUTCDate() - 6,
			0,
			0,
			0,
			0,
		),
	);
	const end = new Date(
		Date.UTC(
			weekEnd.getUTCFullYear(),
			weekEnd.getUTCMonth(),
			weekEnd.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	);

	const entries = await prisma.timesheetEntry.findMany({
		where: {
			organizationId: payload.organizationId,
			workDate: { gte: start, lte: end },
		},
		select: {
			hours: true,
			regularHours: true,
			overtimeHours: true,
			status: true,
			dataSource: true,
		},
	});

	let totalEntries = 0;
	let fileUploadEntries = 0;
	let mobileAppEntries = 0;
	let totalHours = 0;
	let regularHours = 0;
	let overtimeHours = 0;
	let openDisputes = 0;

	for (const e of entries) {
		totalEntries += 1;
		totalHours += e.hours ?? (e.regularHours ?? 0) + (e.overtimeHours ?? 0);
		regularHours += e.regularHours ?? 0;
		overtimeHours += e.overtimeHours ?? 0;
		if (e.dataSource === "FILE_UPLOAD") fileUploadEntries += 1;
		if (e.dataSource === "MOBILE_APP") mobileAppEntries += 1;
		if (e.status === "DISPUTED") openDisputes += 1;
	}

	const totalTimesheets = await prisma.timesheet.count({
		where: { organizationId: payload.organizationId, weekEndingDate: weekEnd },
	});

	const timesheetsForWeek = await prisma.timesheet.findMany({
		where: { organizationId: payload.organizationId, weekEndingDate: weekEnd },
		select: {
			entries: { select: { status: true } },
		},
	});
	let submittedTimesheets = 0;
	let approvedTimesheets = 0;
	for (const t of timesheetsForWeek) {
		const statuses = t.entries.map((e) => e.status);
		if (statuses.length === 0) continue;
		if (statuses.every((s) => s === TimesheetEntryStatus.APPROVED)) {
			approvedTimesheets += 1;
		} else if (statuses.some((s) => s === TimesheetEntryStatus.PENDING)) {
			submittedTimesheets += 1;
		}
	}

	const missingOpen = await prisma.missingTimeCase.count({
		where: {
			organizationId: payload.organizationId,
			status: { in: ["OPEN", "REMINDED"] },
		},
	});

	const missingOverdue = await prisma.missingTimeCase.count({
		where: {
			organizationId: payload.organizationId,
			status: { in: ["OPEN", "REMINDED"] },
			daysOverdue: { gt: 0 },
		},
	});

	const missingResolved = await prisma.missingTimeCase.count({
		where: {
			organizationId: payload.organizationId,
			status: "RESOLVED",
		},
	});

	const resolvedDisputes = await prisma.timesheetDispute.count({
		where: {
			timesheet: {
				organizationId: payload.organizationId,
				weekEndingDate: weekEnd,
			},
			resolution: { not: null },
			resolutionCategory: { not: "REJECTED" },
		},
	});

	const existing = await prisma.timekeepingSummary.findFirst({
		where: {
			organizationId: payload.organizationId,
			weekEndingDate: weekEnd,
			vendorId: null,
			locationId: null,
			departmentId: null,
		},
		select: { id: true },
	});

	const data = {
		totalEntries,
		fileUploadEntries,
		mobileAppEntries,
		totalHours,
		regularHours,
		overtimeHours,
		totalTimesheets,
		submittedTimesheets,
		approvedTimesheets,
		openDisputes,
		resolvedDisputes,
		missingTimeCasesOpen: missingOpen,
		missingTimeCasesResolved: missingResolved,
		missingTimeCasesOverdue: missingOverdue,
	} as const;

	if (existing) {
		const updateData: Prisma.TimekeepingSummaryUncheckedUpdateInput = {
			...data,
		};
		await prisma.timekeepingSummary.update({
			where: { id: existing.id },
			data: updateData,
		});
	} else {
		const createData: Prisma.TimekeepingSummaryUncheckedCreateInput = {
			organizationId: payload.organizationId,
			vendorId: null,
			weekEndingDate: weekEnd,
			locationId: null,
			departmentId: null,
			...data,
		};
		await prisma.timekeepingSummary.create({
			data: createData,
		});
	}
}

import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateComplianceStatus,
	type ComplianceListItemCategory,
	ComplianceListItemResponseStyle,
	ComplianceListItemStatus,
	PlacementComplianceItemSource,
	PlacementComplianceStatus,
	PlacementStatus,
	Prisma,
} from "@repo/db";
import {
	ComplianceListItemExpirationType,
	type ExpirationRuleUnit,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { CandidateComplianceWriteService } from "src/common/services/candidate-compliance-write.service";
import { deriveStoredComplianceStatus } from "src/common/utils/derive-stored-compliance-status";
import type { ComplianceViewerScope } from "src/common/utils/resolve-compliance-viewer-scope";
import {
	hybridSummaryFetch,
	type SummaryEntry,
} from "src/common/utils/summary-hybrid";
import { PrismaService } from "src/prisma/prisma.service";
import type { AddPlacementComplianceItemDto } from "../dto/add-placement-compliance-item.dto";
import type { BulkAddPlacementComplianceItemsDto } from "../dto/bulk-add-placement-compliance-items.dto";
import type { QueryCredentialsDto } from "../dto/query-credentials.dto";
import type { QueryUpcomingComplianceDto } from "../dto/query-upcoming-compliance.dto";
import type { UpdateCandidateComplianceStatusDto } from "../dto/update-candidate-compliance-status.dto";
import { assertPlacementInOrganization } from "../placement-assertions";
import { PLACEMENT_TAB_STATUS } from "../placements.constants";
import { formatLongDate, formatShortDate } from "../placements-formatters";
import type { PlacementListRow } from "../placements-list.include";
import { vendorPlacementWhere } from "../vendor-placement-where";

type CredentialDataRow = {
	id: string;
	placementId: string;
	complianceListItemId: string;
	candidateId: string;
	workerName: string;
	credentialName: string;
	credentialType: string;
	jobTitle: string;
	location: string | null;
	expiryDate: string;
	expiryMeta: string;
	status: "EXPIRING_SOON" | "EXPIRED" | "CRITICAL";
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
};

type UpcomingComplianceRow = {
	id: string;
	candidateName: string;
	candidateInitials: string;
	jobTitle: string;
	location: string | null;
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
	startDate: string;
	startMeta: string;
	complianceStatus: "COMPLETE" | "IN_PROGRESS" | "MISSING";
	progressCompleted: number;
	progressTotal: number;
	missingItems: string;
};

function buildComplianceAuditLog(
	cc: {
		uploadedAt: Date | null;
		verifiedAt: Date | null;
		documentFileName: string | null;
		notes: string | null;
	} | null,
): Array<{
	event: string;
	date: string;
	performedBy: string;
	description: string;
}> {
	if (!cc) {
		return [
			{
				event: "Requirement active",
				date: "—",
				performedBy: "System",
				description: "Awaiting candidate documentation.",
			},
		];
	}
	const logs: Array<{
		event: string;
		date: string;
		performedBy: string;
		description: string;
	}> = [];
	if (cc.uploadedAt) {
		logs.push({
			event: "Document uploaded",
			date: formatLongDate(cc.uploadedAt),
			performedBy: "Candidate",
			description: cc.documentFileName ?? "File submitted",
		});
	}
	if (cc.verifiedAt) {
		logs.push({
			event: "Verified",
			date: formatLongDate(cc.verifiedAt),
			performedBy: "Organization",
			description: cc.notes?.trim() ?? "Record verified",
		});
	}
	if (logs.length === 0) {
		logs.push({
			event: "Pending",
			date: "—",
			performedBy: "—",
			description: "No uploads yet.",
		});
	}
	return logs;
}

@Injectable()
export class PlacementComplianceService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
		private readonly complianceWrite: CandidateComplianceWriteService,
	) {}

	async getPlacementCompliance(
		orgId: string,
		placementId: string,
		viewerScope: ComplianceViewerScope = "org",
	) {
		return this.computePlacementCompliance(orgId, placementId, viewerScope);
	}

	async getAvailableComplianceListItems(
		orgId: string,
		placementId: string,
		search?: string,
	) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				submission: { select: { candidateId: true, requisitionId: true } },
			},
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		const { requisitionId } = placement.submission;

		const [criteria, placementExtras] = await Promise.all([
			this.prisma.requisitionAcceptanceCriterion.findMany({
				where: { requisitionId },
				select: { complianceListItemId: true },
			}),
			this.prisma.placementComplianceItem.findMany({
				where: { placementId, removedAt: null },
				select: { complianceListItemId: true },
			}),
		]);

		const excluded = new Set<string>();
		for (const c of criteria) excluded.add(c.complianceListItemId);
		for (const p of placementExtras) excluded.add(p.complianceListItemId);

		const excludedIds = [...excluded];
		const q = search?.trim();

		const items = await this.prisma.complianceListItem.findMany({
			where: {
				status: ComplianceListItemStatus.ACTIVE,
				...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
				...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
			},
			select: { id: true, name: true, category: true },
			orderBy: { name: "asc" },
			take: 80,
		});

		return {
			data: items.map((i) => ({
				id: i.id,
				name: i.name,
				category: getComplianceListItemCategoryLabel(i.category),
			})),
		};
	}

	async addPlacementComplianceItem(
		orgId: string,
		placementId: string,
		dto: AddPlacementComplianceItemDto,
	) {
		await assertPlacementInOrganization(this.prisma, orgId, placementId);

		const listItem = await this.prisma.complianceListItem.findFirst({
			where: {
				id: dto.complianceListItemId,
				status: ComplianceListItemStatus.ACTIVE,
			},
		});
		if (!listItem) {
			throw new BadRequestException(
				"Compliance list item not found or inactive",
			);
		}

		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId },
			select: { candidateId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		const existingPair = await this.prisma.placementComplianceItem.findFirst({
			where: { placementId, complianceListItemId: dto.complianceListItemId },
		});

		await this.prisma.$transaction(async (tx) => {
			if (existingPair) {
				if (existingPair.removedAt === null) {
					throw new BadRequestException(
						"This requirement is already on the placement",
					);
				}
				if (
					existingPair.source !== PlacementComplianceItemSource.PLACEMENT_EXTRA
				) {
					throw new BadRequestException(
						"This requirement cannot be re-attached here after removal from the requisition checklist.",
					);
				}
				await tx.placementComplianceItem.update({
					where: { id: existingPair.id },
					data: { removedAt: null },
				});
			} else {
				await tx.placementComplianceItem.create({
					data: {
						placementId,
						complianceListItemId: dto.complianceListItemId,
						isRequired: true,
						source: PlacementComplianceItemSource.PLACEMENT_EXTRA,
					},
				});
			}
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			placement.candidateId,
			placementId,
		);

		return this.computePlacementCompliance(orgId, placementId);
	}

	async bulkAddPlacementComplianceItems(
		orgId: string,
		placementId: string,
		dto: BulkAddPlacementComplianceItemsDto,
	) {
		await assertPlacementInOrganization(this.prisma, orgId, placementId);

		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId },
			select: { candidateId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		const ids = [...new Set(dto.complianceListItemIds)];

		const listItems = await this.prisma.complianceListItem.findMany({
			where: { id: { in: ids }, status: ComplianceListItemStatus.ACTIVE },
			select: { id: true },
		});
		const foundIds = new Set(listItems.map((i) => i.id));
		const invalid = ids.filter((id) => !foundIds.has(id));
		if (invalid.length > 0) {
			throw new BadRequestException(
				"One or more compliance list items were not found or are inactive",
			);
		}

		const existingRows = await this.prisma.placementComplianceItem.findMany({
			where: { placementId, complianceListItemId: { in: ids } },
			select: {
				id: true,
				complianceListItemId: true,
				removedAt: true,
				source: true,
			},
		});
		const byListItemId = new Map(
			existingRows.map((r) => [r.complianceListItemId, r]),
		);

		const toCreate: string[] = [];
		const toRestoreIds: string[] = [];

		for (const listItemId of ids) {
			const row = byListItemId.get(listItemId);
			if (!row) {
				toCreate.push(listItemId);
				continue;
			}
			if (row.removedAt === null) {
				continue;
			}
			if (row.source !== PlacementComplianceItemSource.PLACEMENT_EXTRA) {
				throw new BadRequestException(
					"One of the selected items was removed from the requisition checklist and cannot be re-attached here.",
				);
			}
			toRestoreIds.push(row.id);
		}

		await this.prisma.$transaction(async (tx) => {
			if (toCreate.length > 0) {
				await tx.placementComplianceItem.createMany({
					data: toCreate.map((complianceListItemId) => ({
						placementId,
						complianceListItemId,
						isRequired: true,
						source: PlacementComplianceItemSource.PLACEMENT_EXTRA,
					})),
				});
			}
			for (const id of toRestoreIds) {
				await tx.placementComplianceItem.update({
					where: { id },
					data: { removedAt: null },
				});
			}
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			placement.candidateId,
			placementId,
		);

		return this.computePlacementCompliance(orgId, placementId);
	}

	async removePlacementComplianceItem(
		orgId: string,
		placementId: string,
		placementComplianceItemId: string,
	) {
		await assertPlacementInOrganization(this.prisma, orgId, placementId);

		const row = await this.prisma.placementComplianceItem.findFirst({
			where: { id: placementComplianceItemId, placementId, removedAt: null },
		});
		if (!row)
			throw new NotFoundException("Placement compliance item not found.");
		if (row.source !== PlacementComplianceItemSource.PLACEMENT_EXTRA) {
			throw new BadRequestException(
				"Only placement-added requirements can be removed",
			);
		}

		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId },
			select: { candidateId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		await this.prisma.$transaction(async (tx) => {
			await tx.placementComplianceItem.update({
				where: { id: placementComplianceItemId },
				data: { removedAt: new Date() },
			});
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			placement.candidateId,
			placementId,
		);

		return this.computePlacementCompliance(orgId, placementId);
	}

	async batchCompliancePercents(
		rows: PlacementListRow[],
	): Promise<Map<string, number>> {
		if (rows.length === 0) return new Map();
		const candidateByPlacement = new Map(
			rows.map((r) => [r.id, r.candidateId]),
		);

		return hybridSummaryFetch<string, number>({
			scope: "placement-compliance-percent",
			keys: rows.map((r) => r.id),
			fetchSummaries: async (ids): Promise<SummaryEntry<string, number>[]> => {
				const summaries = await this.prisma.placementSummary.findMany({
					where: { placementId: { in: ids } },
					select: {
						placementId: true,
						complianceProgressCompleted: true,
						complianceProgressTotal: true,
						lastComplianceUpdatedAt: true,
					},
				});
				return summaries.map((s) => ({
					key: s.placementId,
					value:
						s.complianceProgressTotal > 0
							? Math.round(
									(s.complianceProgressCompleted / s.complianceProgressTotal) *
										100,
								)
							: 0,
					computedAt: s.lastComplianceUpdatedAt,
				}));
			},
			computeLive: async (staleIds) => {
				const pairs: { placementId: string; candidateId: string }[] = [];
				for (const id of staleIds) {
					const candidateId = candidateByPlacement.get(id);
					if (candidateId) pairs.push({ placementId: id, candidateId });
				}
				return this.computeCompliancePercentsLive(pairs);
			},
			onStale: (staleIds) => {
				for (const id of staleIds) {
					void this.backgroundJobs
						.enqueuePlacementSummary(id)
						.catch(() => undefined);
				}
			},
		});
	}

	/**
	 * Batch live compliance-percent computation. Mirrors the worker's placement
	 * summary calc but without writing to PlacementSummary. Used as the live
	 * fallback in batchCompliancePercents when summary rows are missing/stale.
	 */
	private async computeCompliancePercentsLive(
		pairs: { placementId: string; candidateId: string }[],
	): Promise<Map<string, number>> {
		const out = new Map<string, number>();
		if (pairs.length === 0) return out;

		const placementIds = pairs.map((p) => p.placementId);
		const items = await this.prisma.placementComplianceItem.findMany({
			where: { placementId: { in: placementIds }, removedAt: null },
			select: {
				placementId: true,
				complianceListItemId: true,
			},
		});

		const itemsByPlacement = new Map<
			string,
			{ complianceListItemId: string }[]
		>();
		const allItemIds = new Set<string>();
		for (const it of items) {
			const arr = itemsByPlacement.get(it.placementId) ?? [];
			arr.push({ complianceListItemId: it.complianceListItemId });
			itemsByPlacement.set(it.placementId, arr);
			allItemIds.add(it.complianceListItemId);
		}

		const candidateIds = [...new Set(pairs.map((p) => p.candidateId))];
		const ccRows =
			allItemIds.size > 0 && candidateIds.length > 0
				? await this.prisma.candidateCompliance.findMany({
						where: {
							candidateId: { in: candidateIds },
							complianceListItemId: { in: [...allItemIds] },
						},
						select: {
							candidateId: true,
							complianceListItemId: true,
							status: true,
							expiryDate: true,
						},
					})
				: [];

		const ccByCandidateItem = new Map<
			string,
			{ status: CandidateComplianceStatus; expiryDate: Date | null }
		>();
		const ccKey = (candidateId: string, itemId: string): string =>
			`${candidateId}:${itemId}`;
		for (const r of ccRows) {
			ccByCandidateItem.set(ccKey(r.candidateId, r.complianceListItemId), {
				status: r.status,
				expiryDate: r.expiryDate,
			});
		}

		const now = new Date();
		for (const { placementId, candidateId } of pairs) {
			const required = itemsByPlacement.get(placementId) ?? [];
			const total = required.length;
			if (total === 0) {
				out.set(placementId, 0);
				continue;
			}
			let completed = 0;
			for (const r of required) {
				const cc = ccByCandidateItem.get(
					ccKey(candidateId, r.complianceListItemId),
				);
				if (!cc) continue;
				const isExpired =
					cc.status === CandidateComplianceStatus.EXPIRED ||
					(cc.expiryDate != null && cc.expiryDate <= now);
				const isApproved =
					cc.status === CandidateComplianceStatus.APPROVED &&
					!isExpired &&
					(cc.expiryDate == null || cc.expiryDate > now);
				if (isApproved) completed += 1;
			}
			out.set(placementId, Math.round((completed / total) * 100));
		}

		return out;
	}

	/**
	 * Vendor onboarding dashboard metrics for placements in [windowStart, windowEnd].
	 * Progress % uses {@link placement_summary} (`complianceProgressCompleted` /
	 * `complianceProgressTotal`) — same source as {@link batchCompliancePercents} and the
	 * onboarding tracker list. Day-diff rule matches vendor onboarding (start vs
	 * `windowStart`, calendar days). Single aggregation query.
	 */
	async aggregateVendorOnboardingMetrics(params: {
		organizationId: string;
		vendorId: string;
		windowStart: Date;
		windowEnd: Date;
	}): Promise<{
		totalPlacements: number;
		cleared: number;
		inProgress: number;
		behindSchedule: number;
	}> {
		const { organizationId, vendorId, windowStart, windowEnd } = params;
		const upcomingStatusSql = Prisma.join(
			PLACEMENT_TAB_STATUS.upcoming.map(
				(s) => Prisma.sql`${s}::"PlacementStatus"`,
			),
		);
		const rows = await this.prisma.$queryRaw<
			Array<{
				totalPlacements: number;
				cleared: number;
				inProgress: number;
				behindSchedule: number;
			}>
		>`
			WITH pct_by_placement AS (
				SELECT
					p.id,
					p."startDate",
					CASE
						WHEN COALESCE(ps."complianceProgressTotal", 0) = 0 THEN 100
						ELSE ROUND(
							100.0 * COALESCE(ps."complianceProgressCompleted", 0)::numeric
							/ NULLIF(ps."complianceProgressTotal", 0)
						)::integer
					END AS pct
				FROM placement p
				INNER JOIN submission s ON s.id = p."submissionId"
				LEFT JOIN placement_summary ps ON ps."placementId" = p.id
				WHERE p."organizationId" = ${organizationId}::uuid
					AND p.status IN (${upcomingStatusSql})
					AND p."startDate" IS NOT NULL
					AND p."startDate" >= ${windowStart}
					AND p."startDate" <= ${windowEnd}
					AND s."vendorId" = ${vendorId}::uuid
			)
			SELECT
				COUNT(*)::int AS "totalPlacements",
				COUNT(*) FILTER (WHERE pct >= 100)::int AS cleared,
				COUNT(*) FILTER (
					WHERE pct < 100
						AND (("startDate"::date - (${windowStart}::timestamptz)::date) <= 5)
				)::int AS "behindSchedule",
				COUNT(*) FILTER (
					WHERE pct < 100
						AND (("startDate"::date - (${windowStart}::timestamptz)::date) > 5)
				)::int AS "inProgress"
			FROM pct_by_placement
		`;
		const row = rows[0];
		return {
			totalPlacements: row?.totalPlacements ?? 0,
			cleared: row?.cleared ?? 0,
			inProgress: row?.inProgress ?? 0,
			behindSchedule: row?.behindSchedule ?? 0,
		};
	}

	private async computePlacementCompliance(
		orgId: string,
		placementId: string,
		viewerScope: ComplianceViewerScope = "org",
	) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			select: { candidateId: true, requisitionId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		return this.computePlacementComplianceForKnown(
			placementId,
			placement.candidateId,
			viewerScope,
		);
	}

	private async computePlacementComplianceForKnown(
		placementId: string,
		candidateId: string,
		viewerScope: ComplianceViewerScope = "org",
	) {
		const allPciRows = await this.prisma.placementComplianceItem.findMany({
			where: { placementId, removedAt: null },
			include: { complianceListItem: true },
		});

		const pciRows =
			viewerScope === "org"
				? allPciRows
				: allPciRows.filter(
						(p) =>
							p.complianceListItem.displayToCandidate &&
							p.complianceListItem.responseStyle !==
								ComplianceListItemResponseStyle.INTERNAL_TASK,
					);

		const listItemIds = pciRows.map((p) => p.complianceListItemId);

		if (listItemIds.length === 0) {
			return {
				summary: {
					complete: 0,
					missing: 0,
					expired: 0,
					pending: 0,
					rejected: 0,
					total: 0,
				},
				categories: [] as Array<{
					categoryKey: string;
					title: string;
					completed: number;
					total: number;
					items: Array<{
						complianceListItemId: string;
						name: string;
						category: string;
						categoryKey: string;
						status: `${CandidateComplianceStatus}`;
						rejectionReason: string | null;
						responseStyle: `${ComplianceListItemResponseStyle}`;
						link: string | null;
						expirationType: `${ComplianceListItemExpirationType}`;
						expirationRuleValue: number | null;
						expirationRuleUnit: `${ExpirationRuleUnit}` | null;
						issueDate: string | null;
						completionDate: string | null;
						expirationDate: string | null;
						documentName: string | null;
						source: "requisition" | "placement";
						placementComplianceItemId: string | null;
						canRemove: boolean;
						auditLog: Array<{
							event: string;
							date: string;
							performedBy: string;
							description: string;
						}>;
					}>;
				}>,
			};
		}

		const candidateCompliances = await this.prisma.candidateCompliance.findMany(
			{
				where: {
					candidateId,
					complianceListItemId: { in: listItemIds },
				},
			},
		);

		const ccByListItem = new Map(
			candidateCompliances.map((cc) => [cc.complianceListItemId, cc]),
		);

		const now = new Date();
		const rowItems = pciRows.map((pci) => {
			const li = pci.complianceListItem;
			const cc = ccByListItem.get(li.id) ?? null;
			const status = deriveStoredComplianceStatus(cc, now);
			const fromRequisition =
				pci.source === PlacementComplianceItemSource.REQUISITION;

			return {
				complianceListItemId: li.id,
				name: li.name,
				category: getComplianceListItemCategoryLabel(li.category),
				categoryKey: li.category,
				status,
				rejectionReason:
					status === CandidateComplianceStatus.REJECTED
						? (cc?.notes?.trim() ?? null)
						: null,
				responseStyle: li.responseStyle,
				link: li.file,
				expirationType: li.expirationType,
				expirationRuleValue: li.expirationRuleValue,
				expirationRuleUnit: li.expirationRuleUnit,
				issueDate: cc?.issueDate != null ? formatShortDate(cc.issueDate) : null,
				completionDate:
					cc?.verifiedAt != null
						? formatShortDate(cc.verifiedAt)
						: cc?.uploadedAt != null
							? formatShortDate(cc.uploadedAt)
							: null,
				expirationDate:
					cc?.expiryDate != null ? formatShortDate(cc.expiryDate) : null,
				documentName: cc?.documentFileName ?? null,
				source: (fromRequisition ? "requisition" : "placement") as
					| "requisition"
					| "placement",
				placementComplianceItemId: fromRequisition ? null : pci.id,
				canRemove: pci.source === PlacementComplianceItemSource.PLACEMENT_EXTRA,
				auditLog: buildComplianceAuditLog(cc),
			};
		});

		const byCat = new Map<string, (typeof rowItems)[number][]>();
		for (const item of rowItems) {
			const arr = byCat.get(item.categoryKey) ?? [];
			arr.push(item);
			byCat.set(item.categoryKey, arr);
		}

		const categories = [...byCat.entries()]
			.map(([categoryKey, items]) => ({
				categoryKey,
				title: getComplianceListItemCategoryLabel(
					categoryKey as ComplianceListItemCategory,
				),
				completed: items.filter(
					(i) => i.status === CandidateComplianceStatus.APPROVED,
				).length,
				total: items.length,
				items: items.sort((a, b) => a.name.localeCompare(b.name)),
			}))
			.sort((a, b) => a.title.localeCompare(b.title));

		const summary = {
			complete: rowItems.filter(
				(i) => i.status === CandidateComplianceStatus.APPROVED,
			).length,
			missing: rowItems.filter(
				(i) => i.status === CandidateComplianceStatus.MISSING,
			).length,
			expired: rowItems.filter(
				(i) => i.status === CandidateComplianceStatus.EXPIRED,
			).length,
			pending: rowItems.filter(
				(i) => i.status === CandidateComplianceStatus.PENDING_REVIEW,
			).length,
			rejected: rowItems.filter(
				(i) => i.status === CandidateComplianceStatus.REJECTED,
			).length,
			total: rowItems.length,
		};

		return { summary, categories };
	}

	private buildPlacementSummaryWhere(
		orgId: string,
		statuses: PlacementStatus[],
		filters: {
			locationId?: string;
			departmentId?: string;
			vendorId?: string;
			hiringManagerId?: string;
			search?: string;
		},
	): Prisma.PlacementSummaryWhereInput {
		const where: Prisma.PlacementSummaryWhereInput = {
			organizationId: orgId,
			status: { in: statuses },
		};

		if (filters.vendorId) where.vendorId = filters.vendorId;

		const placementNested: Prisma.PlacementWhereInput = {};
		if (filters.locationId) placementNested.locationId = filters.locationId;
		if (filters.departmentId)
			placementNested.departmentId = filters.departmentId;
		if (filters.hiringManagerId)
			placementNested.hiringManagerId = filters.hiringManagerId;
		if (Object.keys(placementNested).length > 0) {
			where.placement = { is: placementNested };
		}

		if (filters.search) {
			const q = filters.search;
			where.OR = [
				{
					placement: {
						is: { jobTitle: { contains: q, mode: "insensitive" } },
					},
				},
				{
					placement: {
						is: {
							candidate: {
								is: {
									user: { is: { name: { contains: q, mode: "insensitive" } } },
								},
							},
						},
					},
				},
			];
		}

		return where;
	}

	async getCredentialCounts(
		orgId: string,
		filters: Pick<
			QueryCredentialsDto,
			"locationId" | "departmentId" | "vendorId" | "hiringManagerId"
		>,
	) {
		const where: Prisma.CredentialExpirySummaryWhereInput = {
			organizationId: orgId,
			...(filters.locationId && { locationId: filters.locationId }),
			...(filters.departmentId && { departmentId: filters.departmentId }),
			...(filters.vendorId && { vendorId: filters.vendorId }),
			...(filters.hiringManagerId && {
				hiringManagerId: filters.hiringManagerId,
			}),
		};

		const [expiringSoon, critical, expired] = await Promise.all([
			this.prisma.credentialExpirySummary.count({
				where: { ...where, status: "EXPIRING_SOON" },
			}),
			this.prisma.credentialExpirySummary.count({
				where: { ...where, status: "CRITICAL" },
			}),
			this.prisma.credentialExpirySummary.count({
				where: { ...where, status: "EXPIRED" },
			}),
		]);

		return {
			EXPIRING_SOON: expiringSoon,
			EXPIRED: expired,
			CRITICAL: critical,
		};
	}

	async getCredentialsList(orgId: string, query: QueryCredentialsDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const status =
			query.status === "EXPIRED" ||
			query.status === "CRITICAL" ||
			query.status === "EXPIRING_SOON"
				? query.status
				: undefined;

		const search = query.search?.trim();
		const where: Prisma.CredentialExpirySummaryWhereInput = {
			organizationId: orgId,
			...(status && { status }),
			...(query.locationId && { locationId: query.locationId }),
			...(query.departmentId && { departmentId: query.departmentId }),
			...(query.vendorId && { vendorId: query.vendorId }),
			...(query.hiringManagerId && { hiringManagerId: query.hiringManagerId }),
			...(search && {
				OR: [
					{ workerName: { contains: search, mode: "insensitive" } },
					{ credentialName: { contains: search, mode: "insensitive" } },
					{ credentialTypeLabel: { contains: search, mode: "insensitive" } },
					{ jobTitle: { contains: search, mode: "insensitive" } },
					{ requisitionJobTitle: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [total, rows] = await Promise.all([
			this.prisma.credentialExpirySummary.count({ where }),
			this.prisma.credentialExpirySummary.findMany({
				where,
				orderBy: [
					{ expiryDate: "asc" },
					{ placementId: "asc" },
					{ complianceListItemId: "asc" },
				],
				skip,
				take: limit,
				select: {
					placementId: true,
					candidateId: true,
					complianceListItemId: true,
					status: true,
					expiryDate: true,
					workerName: true,
					credentialName: true,
					credentialTypeLabel: true,
					jobTitle: true,
					locationName: true,
					departmentName: true,
					vendorName: true,
					hiringManagerName: true,
					requisitionJobTitle: true,
				},
			}),
		]);

		if (total === 0) return { data: [], total: 0, page, limit, totalPages: 1 };

		const data = rows.map((r) => {
			const daysLeft = r.expiryDate
				? Math.ceil(
						(r.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
					)
				: null;
			return {
				id: `${r.placementId}:${r.complianceListItemId}`,
				placementId: r.placementId,
				complianceListItemId: r.complianceListItemId,
				candidateId: r.candidateId,
				workerName: r.workerName,
				credentialName: r.credentialName,
				credentialType: r.credentialTypeLabel,
				jobTitle: r.jobTitle ?? r.requisitionJobTitle ?? "—",
				location: r.locationName ?? null,
				expiryDate: r.expiryDate ? formatShortDate(r.expiryDate) : "—",
				expiryMeta:
					r.status === "EXPIRED"
						? "Requires action"
						: daysLeft !== null
							? `${daysLeft} days remaining`
							: "—",
				status: r.status,
				department: r.departmentName ?? null,
				vendor: r.vendorName ?? null,
				hiringManager: r.hiringManagerName ?? null,
			} satisfies CredentialDataRow;
		});

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	private readonly upcomingPlacementSelect = {
		placementId: true,
		complianceStatus: true,
		complianceProgressCompleted: true,
		complianceProgressTotal: true,
		complianceMissingItemsPreview: true,
		placement: {
			select: {
				jobTitle: true,
				startDate: true,
				location: { select: { name: true } },
				department: { select: { name: true } },
				hiringManager: { select: { name: true } },
				submission: {
					select: {
						vendor: { select: { name: true } },
						requisition: { select: { jobTitle: true } },
						candidate: { select: { user: { select: { name: true } } } },
					},
				},
			},
		},
	} as const;

	private mapUpcomingComplianceRow(p: {
		placementId: string;
		complianceStatus: PlacementComplianceStatus;
		complianceProgressCompleted: number;
		complianceProgressTotal: number;
		complianceMissingItemsPreview: string | null;
		placement: {
			jobTitle: string | null;
			startDate: Date | null;
			location: { name: string } | null;
			department: { name: string } | null;
			hiringManager: { name: string } | null;
			submission: {
				vendor: { name: string } | null;
				requisition: { jobTitle: string | null } | null;
				candidate: { user: { name: string } };
			};
		};
	}): UpcomingComplianceRow {
		const now = new Date();
		const candidateName =
			p.placement.submission.candidate.user?.name ?? "Unknown candidate";
		const candidateInitials = candidateName
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);

		const daysLeft = p.placement.startDate
			? Math.ceil(
					(p.placement.startDate.getTime() - now.getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: null;
		const startMeta =
			daysLeft !== null
				? daysLeft > 0
					? `${daysLeft} days away`
					: "Starting today or past due"
				: "—";

		return {
			id: p.placementId,
			candidateName,
			candidateInitials,
			jobTitle:
				p.placement.jobTitle ??
				p.placement.submission.requisition?.jobTitle ??
				"—",
			location: p.placement.location?.name ?? null,
			department: p.placement.department?.name ?? null,
			vendor: p.placement.submission.vendor?.name ?? null,
			hiringManager: p.placement.hiringManager?.name ?? null,
			startDate: p.placement.startDate
				? formatShortDate(p.placement.startDate)
				: "—",
			startMeta,
			complianceStatus: p.complianceStatus as
				| "COMPLETE"
				| "IN_PROGRESS"
				| "MISSING",
			progressCompleted: p.complianceProgressCompleted,
			progressTotal: p.complianceProgressTotal,
			missingItems: p.complianceMissingItemsPreview ?? "",
		};
	}

	async getUpcomingComplianceCounts(
		orgId: string,
		filters: Pick<
			QueryUpcomingComplianceDto,
			"locationId" | "departmentId" | "vendorId" | "hiringManagerId" | "search"
		>,
	) {
		const where: Prisma.PlacementSummaryWhereInput = {
			...this.buildPlacementSummaryWhere(
				orgId,
				PLACEMENT_TAB_STATUS.upcoming,
				filters,
			),
		};

		const [total, groups] = await Promise.all([
			this.prisma.placementSummary.count({ where }),
			this.prisma.placementSummary.groupBy({
				by: ["complianceStatus"],
				where,
				_count: { _all: true },
			}),
		]);

		const countMap = new Map(
			groups.map((g) => [g.complianceStatus, g._count._all]),
		);

		return {
			TOTAL_UPCOMING: total,
			READY_TO_START: countMap.get(PlacementComplianceStatus.COMPLETE) ?? 0,
			IN_PROGRESS: countMap.get(PlacementComplianceStatus.IN_PROGRESS) ?? 0,
			MISSING_ITEMS: countMap.get(PlacementComplianceStatus.MISSING) ?? 0,
		};
	}

	async getUpcomingComplianceList(
		orgId: string,
		query: QueryUpcomingComplianceDto,
	) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		const whereSummary: Prisma.PlacementSummaryWhereInput = {
			...this.buildPlacementSummaryWhere(
				orgId,
				PLACEMENT_TAB_STATUS.upcoming,
				query,
			),
			...(query.complianceStatus
				? {
						complianceStatus:
							query.complianceStatus as PlacementComplianceStatus,
					}
				: {}),
		};

		const [total, placements] = await Promise.all([
			this.prisma.placementSummary.count({ where: whereSummary }),
			this.prisma.placementSummary.findMany({
				where: whereSummary,
				select: this.upcomingPlacementSelect,
				orderBy: { placement: { startDate: "asc" } },
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);

		if (placements.length === 0)
			return {
				data: [],
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit) || 1,
			};

		const data = placements.map((p) => this.mapUpcomingComplianceRow(p));

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async getPlacementCredentialDetail(
		orgId: string,
		placementId: string,
		viewerScope: ComplianceViewerScope = "org",
	) {
		const p = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			select: {
				id: true,
				candidateId: true,
				requisitionId: true,
				jobTitle: true,
				startDate: true,
				status: true,
				location: { select: { name: true } },
				department: { select: { name: true } },
				hiringManager: { select: { name: true } },
				submission: {
					select: {
						vendor: { select: { name: true } },
						requisition: { select: { jobTitle: true } },
						candidate: { select: { user: { select: { name: true } } } },
					},
				},
			},
		});
		if (!p) throw new NotFoundException("Placement not found.");

		const compliance = await this.computePlacementComplianceForKnown(
			placementId,
			p.candidateId,
			viewerScope,
		);

		return {
			candidateName: p.submission.candidate.user?.name ?? "—",
			jobTitle: p.jobTitle ?? p.submission.requisition?.jobTitle ?? "—",
			location: p.location?.name ?? "—",
			department: p.department?.name ?? "—",
			vendor: p.submission.vendor?.name ?? null,
			hiringManager: p.hiringManager?.name ?? "—",
			startDate: p.startDate ? formatShortDate(p.startDate) : "—",
			status: p.status,
			...compliance,
		};
	}

	async vendorUpdatePlacementComplianceStatus(
		orgId: string,
		vendorId: string,
		placementId: string,
		complianceListItemId: string,
		dto: UpdateCandidateComplianceStatusDto,
		userId: string,
	) {
		const placement = await this.prisma.placement.findFirst({
			where: vendorPlacementWhere(orgId, placementId, vendorId),
			select: { candidateId: true },
		});
		if (!placement) {
			throw new NotFoundException("Placement not found for this vendor.");
		}

		const requirement = await this.prisma.placementComplianceItem.findFirst({
			where: { placementId, complianceListItemId, removedAt: null },
			select: { id: true },
		});
		if (!requirement) {
			throw new NotFoundException("Compliance item not on this placement.");
		}

		const [existing, listItem] = await Promise.all([
			this.prisma.candidateCompliance.findUnique({
				where: {
					candidateId_complianceListItemId: {
						candidateId: placement.candidateId,
						complianceListItemId,
					},
				},
			}),
			this.prisma.complianceListItem.findUnique({
				where: { id: complianceListItemId },
				select: { responseStyle: true },
			}),
		]);
		const isLinkItem =
			listItem?.responseStyle === ComplianceListItemResponseStyle.LINK;
		const candidateHasActed = isLinkItem
			? existing?.status === CandidateComplianceStatus.PENDING_REVIEW ||
				existing?.status === CandidateComplianceStatus.APPROVED ||
				existing?.status === CandidateComplianceStatus.REJECTED
			: !!existing?.documentUrl?.trim();
		if (
			dto.status === CandidateComplianceStatus.APPROVED &&
			!candidateHasActed
		) {
			throw new BadRequestException(
				isLinkItem
					? "Cannot approve until the candidate marks the link as submitted"
					: "Cannot approve without an uploaded document",
			);
		}

		return this.applyCandidateComplianceStatus(
			placement.candidateId,
			complianceListItemId,
			dto,
			userId,
			placementId,
		);
	}

	async updateCandidateComplianceStatus(
		orgId: string,
		placementId: string,
		complianceListItemId: string,
		dto: UpdateCandidateComplianceStatusDto,
		userId: string,
	) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			select: { candidateId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		return this.applyCandidateComplianceStatus(
			placement.candidateId,
			complianceListItemId,
			dto,
			userId,
			placementId,
		);
	}

	private async applyCandidateComplianceStatus(
		candidateId: string,
		complianceListItemId: string,
		dto: UpdateCandidateComplianceStatusDto,
		userId: string,
		placementId: string,
	) {
		let expiryDate: Date | null = null;
		if (dto.expiryDate?.trim()) {
			const d = new Date(dto.expiryDate.trim());
			if (!Number.isNaN(d.getTime())) expiryDate = d;
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.candidateCompliance.upsert({
				where: {
					candidateId_complianceListItemId: {
						candidateId,
						complianceListItemId,
					},
				},
				update: {
					status: dto.status,
					notes: dto.notes ?? null,
					expiryDate,
					...(dto.status === CandidateComplianceStatus.APPROVED
						? { verifiedById: userId, verifiedAt: new Date() }
						: { verifiedById: null, verifiedAt: null }),
				},
				create: {
					candidateId,
					complianceListItemId,
					status: dto.status,
					notes: dto.notes ?? null,
					expiryDate,
					...(dto.status === CandidateComplianceStatus.APPROVED
						? { verifiedById: userId, verifiedAt: new Date() }
						: {}),
				},
			});
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			candidateId,
			placementId,
		);

		const placement = await this.prisma.placement.findUniqueOrThrow({
			where: { id: placementId },
			select: { organizationId: true },
		});
		return this.computePlacementCompliance(
			placement.organizationId,
			placementId,
		);
	}

	async vendorUploadCandidateComplianceDocument(
		orgId: string,
		vendorId: string,
		placementId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
		userId: string,
	) {
		const placement = await this.prisma.placement.findFirst({
			where: vendorPlacementWhere(orgId, placementId, vendorId),
			select: { id: true },
		});
		if (!placement) {
			throw new NotFoundException("Placement not found for this vendor.");
		}
		return this.uploadCandidateComplianceDocument(
			orgId,
			placementId,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
			userId,
		);
	}

	private async loadPlacementForMarkLink(
		orgId: string,
		placementId: string,
		extraWhere: { vendorId?: string } = {},
	) {
		const where = extraWhere.vendorId
			? vendorPlacementWhere(orgId, placementId, extraWhere.vendorId)
			: { id: placementId, organizationId: orgId };
		const placement = await this.prisma.placement.findFirst({
			where,
			select: {
				candidateId: true,
				candidate: { select: { workforceType: true } },
			},
		});
		if (!placement) {
			throw new NotFoundException(
				extraWhere.vendorId
					? "Placement not found for this vendor"
					: "Placement not found",
			);
		}
		return placement;
	}

	private async applyMarkLinkSubmittedForPlacement(
		orgId: string,
		placement: {
			candidateId: string;
			candidate: {
				workforceType: `${import("@repo/db").CandidateWorkforceType}` | null;
			};
		},
		placementId: string,
		complianceListItemId: string,
		userId: string,
	) {
		await this.complianceWrite.assertComplianceListItemOnPlacement(
			orgId,
			placementId,
			complianceListItemId,
		);

		await this.complianceWrite.writeMarkLinkSubmitted({
			candidateId: placement.candidateId,
			workforceType: placement.candidate.workforceType,
			complianceListItemId,
			userId,
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			placement.candidateId,
			placementId,
		);

		return this.computePlacementCompliance(orgId, placementId);
	}

	async markComplianceLinkSubmittedForPlacement(
		orgId: string,
		placementId: string,
		complianceListItemId: string,
		userId: string,
	) {
		const placement = await this.loadPlacementForMarkLink(orgId, placementId);
		return this.applyMarkLinkSubmittedForPlacement(
			orgId,
			placement,
			placementId,
			complianceListItemId,
			userId,
		);
	}

	async vendorMarkComplianceLinkSubmittedForPlacement(
		orgId: string,
		vendorId: string,
		placementId: string,
		complianceListItemId: string,
		userId: string,
	) {
		const placement = await this.loadPlacementForMarkLink(orgId, placementId, {
			vendorId,
		});
		return this.applyMarkLinkSubmittedForPlacement(
			orgId,
			placement,
			placementId,
			complianceListItemId,
			userId,
		);
	}

	async uploadCandidateComplianceDocument(
		orgId: string,
		placementId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
		userId: string,
	) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			select: {
				candidateId: true,
				candidate: { select: { workforceType: true } },
			},
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		await this.complianceWrite.assertComplianceListItemOnPlacement(
			orgId,
			placementId,
			complianceListItemId,
		);

		await this.complianceWrite.writeUpload({
			candidateId: placement.candidateId,
			workforceType: placement.candidate.workforceType,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
			userId,
			s3KeyPath: `${orgId}/${placementId}/${complianceListItemId}`,
		});

		await this.backgroundJobs.enqueueComplianceRelatedSummaries(
			placement.candidateId,
			placementId,
		);

		return this.computePlacementCompliance(orgId, placementId);
	}
}

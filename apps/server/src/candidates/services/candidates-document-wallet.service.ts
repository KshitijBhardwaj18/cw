import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateComplianceStatus,
	type CandidateWorkforceType,
	type ComplianceListItem,
	type ComplianceListItemCategory,
	ComplianceListItemResponseStyle,
	ComplianceListItemStatus,
	PlacementStatus,
	type Prisma,
} from "@repo/db";
import {
	ComplianceListItemExpirationType,
	type ExpirationRuleUnit,
	getComplianceListItemCategoryLabel,
	type PagePaginatedResponse,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { CandidateComplianceWriteService } from "src/common/services/candidate-compliance-write.service";
import { deriveStoredComplianceStatus } from "src/common/utils/derive-stored-compliance-status";
import {
	hybridSummaryFetch,
	type SummaryEntry,
} from "src/common/utils/summary-hybrid";
import { FilesService } from "src/files/files.service";
import type { UpdateCandidateComplianceStatusDto } from "src/placements/dto/update-candidate-compliance-status.dto";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueryVendorDocumentWalletsDto } from "../dto/query-vendor-document-wallets.dto";
import type {
	VendorDocumentWalletListRowDto,
	VendorDocumentWalletListStatus,
	VendorDocumentWalletMetricsDto,
} from "../dto/vendor-document-wallets-response.dto";

type WalletRow = {
	complianceListItemId: string;
	placementId: null;
	title: string;
	description: string;
	categoryKey: ComplianceListItemCategory;
	status: `${CandidateComplianceStatus}`;
	rejectionReason: string | null;
	uploadedAt: string | null;
	issuedAt: string | null;
	expiresAt: string | null;
	documentFileName: string | null;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
	responseStyle: `${ComplianceListItemResponseStyle}`;
	link: string | null;
};

/** Minimal candidate shape for batched wallet template + compliance resolution */
type CandidateWalletKey = {
	id: string;
	occupationId: string;
	candidateSpecialties: { specialtyId: string }[];
};

type LiveWalletStats = {
	walletTotalComplianceItems: number;
	walletApprovedComplianceItems: number;
	walletPendingUploadComplianceItems: number;
	walletPendingVerificationComplianceItems: number;
	walletExpiredComplianceItems: number;
};

const VENDOR_WALLET_LIST_SELECT = {
	id: true,
	occupationId: true,
	createdAt: true,
	user: {
		select: { name: true, email: true, phoneNumber: true },
	},
	candidateSpecialties: {
		orderBy: { id: "asc" as const },
		select: {
			specialtyId: true,
			specialty: { select: { name: true, acronym: true } },
		},
	},
} satisfies Prisma.CandidateSelect;

@Injectable()
export class CandidatesDocumentWalletService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
		private readonly backgroundJobs: BackgroundJobsService,
		private readonly complianceWrite: CandidateComplianceWriteService,
	) {}

	/** Compound lookup for (organizationOccupationId, specialtyId) → organization_specialty.id */
	private orgOccSpecialtyCompoundKey(
		organizationOccupationId: string,
		specialtyId: string,
	): string {
		return `${organizationOccupationId}:${specialtyId}`;
	}

	private async fetchOrgOccupationsForWalletBatch(
		organizationId: string,
		occupationIds: string[],
	) {
		return this.prisma.organizationOccupation.findMany({
			where: {
				organizationId,
				occupationId: { in: occupationIds },
			},
			select: { id: true, occupationId: true },
		});
	}

	private async fetchOrgSpecialtiesForWalletBatch(
		organizationId: string,
		orgOccIds: string[],
		unionSpecialtyIds: Set<string>,
	) {
		if (unionSpecialtyIds.size === 0) {
			return [];
		}
		return this.prisma.organizationSpecialty.findMany({
			where: {
				organizationId,
				organizationOccupationId: { in: orgOccIds },
				specialtyId: { in: [...unionSpecialtyIds] },
			},
			select: {
				id: true,
				organizationOccupationId: true,
				specialtyId: true,
			},
		});
	}

	private buildOrgSpecialtyPkByOccAndSpec(
		rows: Array<{
			id: string;
			organizationOccupationId: string;
			specialtyId: string;
		}>,
	): Map<string, string> {
		return new Map(
			rows.map((r) => [
				this.orgOccSpecialtyCompoundKey(
					r.organizationOccupationId,
					r.specialtyId,
				),
				r.id,
			]),
		);
	}

	private async fetchWalletTemplatesForOrgOccupations(
		organizationId: string,
		orgOccIds: string[],
		templateSpecIdUnion: Set<string>,
	) {
		const templatesWhere: Prisma.ComplianceWalletTemplateWhereInput = {
			organizationId,
			organizationOccupationId: { in: orgOccIds },
			...(templateSpecIdUnion.size > 0
				? {
						OR: [
							{ organizationSpecialtyId: null },
							{ organizationSpecialtyId: { in: [...templateSpecIdUnion] } },
						],
					}
				: { organizationSpecialtyId: null }),
		};

		return this.prisma.complianceWalletTemplate.findMany({
			where: templatesWhere,
			include: {
				complianceWalletTemplateItems: {
					include: { complianceListItem: true },
				},
			},
		});
	}

	private groupWalletTemplatesByOrgOccupationId<
		T extends { organizationOccupationId: string },
	>(templates: T[]): Map<string, T[]> {
		const byOrgOcc = new Map<string, T[]>();
		for (const t of templates) {
			const arr = byOrgOcc.get(t.organizationOccupationId) ?? [];
			arr.push(t);
			byOrgOcc.set(t.organizationOccupationId, arr);
		}
		return byOrgOcc;
	}

	/**
	 * Merges active displayable list items from templates applicable to this candidate.
	 */
	private mergeWalletTemplateListItemsForCandidate(
		relevantTemplates: Array<{
			organizationSpecialtyId: string | null;
			complianceWalletTemplateItems: Array<{
				complianceListItem: ComplianceListItem;
			}>;
		}>,
		orgSpecialtyPkSet: Set<string>,
	): Map<string, ComplianceListItem> {
		const byId = new Map<string, ComplianceListItem>();
		for (const t of relevantTemplates) {
			if (
				t.organizationSpecialtyId !== null &&
				!orgSpecialtyPkSet.has(t.organizationSpecialtyId)
			) {
				continue;
			}
			for (const wi of t.complianceWalletTemplateItems) {
				const li = wi.complianceListItem;
				if (
					li.status !== ComplianceListItemStatus.ACTIVE ||
					!li.displayToCandidate ||
					li.responseStyle === ComplianceListItemResponseStyle.INTERNAL_TASK
				) {
					continue;
				}
				if (!byId.has(li.id)) {
					byId.set(li.id, li);
				}
			}
		}
		return byId;
	}

	/**
	 * Loads merged template compliance list items for many candidates in a bounded
	 * set of DB round-trips (org occupations → org specialties → wallet templates).
	 */
	private async loadTemplateComplianceListItemsByCandidates(
		organizationId: string,
		candidates: CandidateWalletKey[],
	): Promise<Map<string, Map<string, ComplianceListItem>>> {
		const result = new Map<string, Map<string, ComplianceListItem>>();
		if (candidates.length === 0) {
			return result;
		}

		const uniqueOccupationIds = [
			...new Set(candidates.map((c) => c.occupationId)),
		];
		const orgOccupations = await this.fetchOrgOccupationsForWalletBatch(
			organizationId,
			uniqueOccupationIds,
		);
		const orgOccByOccupationId = new Map(
			orgOccupations.map((o) => [o.occupationId, o] as const),
		);

		const unionSpecialtyIds = new Set<string>();
		for (const c of candidates) {
			for (const s of c.candidateSpecialties) {
				unionSpecialtyIds.add(s.specialtyId);
			}
		}

		const orgOccIds = orgOccupations.map((o) => o.id);
		if (orgOccIds.length === 0) {
			for (const c of candidates) {
				result.set(c.id, new Map());
			}
			return result;
		}

		const orgSpecialtyRows = await this.fetchOrgSpecialtiesForWalletBatch(
			organizationId,
			orgOccIds,
			unionSpecialtyIds,
		);
		const orgSpecPkByOccAndSpec =
			this.buildOrgSpecialtyPkByOccAndSpec(orgSpecialtyRows);
		const templateSpecIdUnion = new Set(orgSpecialtyRows.map((o) => o.id));

		const templates = await this.fetchWalletTemplatesForOrgOccupations(
			organizationId,
			orgOccIds,
			templateSpecIdUnion,
		);
		const templatesByOrgOcc =
			this.groupWalletTemplatesByOrgOccupationId(templates);

		for (const c of candidates) {
			const oo = orgOccByOccupationId.get(c.occupationId);
			if (!oo) {
				result.set(c.id, new Map());
				continue;
			}

			const specPkList: string[] = [];
			for (const cs of c.candidateSpecialties) {
				const pk = orgSpecPkByOccAndSpec.get(
					this.orgOccSpecialtyCompoundKey(oo.id, cs.specialtyId),
				);
				if (pk) specPkList.push(pk);
			}
			const specPkSet = new Set(specPkList);

			const relevantTemplates = templatesByOrgOcc.get(oo.id) ?? [];
			const byId = this.mergeWalletTemplateListItemsForCandidate(
				relevantTemplates,
				specPkSet,
			);
			result.set(c.id, byId);
		}

		return result;
	}

	/**
	 * Builds wallet rows for many candidates using batched template + compliance loads.
	 */
	private async buildWalletRowsForOrganizationAndCandidatesBatch(
		organizationId: string,
		candidates: CandidateWalletKey[],
	): Promise<Map<string, WalletRow[]>> {
		const out = new Map<string, WalletRow[]>();
		if (candidates.length === 0) {
			return out;
		}

		const listItemsByCandidate =
			await this.loadTemplateComplianceListItemsByCandidates(
				organizationId,
				candidates,
			);

		const allItemIds = new Set<string>();
		for (const c of candidates) {
			const m = listItemsByCandidate.get(c.id);
			if (m) {
				for (const id of m.keys()) {
					allItemIds.add(id);
				}
			}
		}

		const candidateIds = candidates.map((c) => c.id);
		const complianceRows =
			allItemIds.size > 0
				? await this.prisma.candidateCompliance.findMany({
						where: {
							candidateId: { in: candidateIds },
							complianceListItemId: { in: [...allItemIds] },
						},
					})
				: [];

		const ccByCandidate = new Map<
			string,
			Map<string, (typeof complianceRows)[number]>
		>();
		for (const row of complianceRows) {
			let inner = ccByCandidate.get(row.candidateId);
			if (!inner) {
				inner = new Map();
				ccByCandidate.set(row.candidateId, inner);
			}
			inner.set(row.complianceListItemId, row);
		}

		const now = new Date();
		for (const c of candidates) {
			const listItemsById = listItemsByCandidate.get(c.id) ?? new Map();
			const ccByItem = ccByCandidate.get(c.id) ?? new Map();
			const rows: WalletRow[] = [];
			for (const li of listItemsById.values()) {
				const cc = ccByItem.get(li.id) ?? null;
				const status = deriveStoredComplianceStatus(cc, now);
				rows.push({
					complianceListItemId: li.id,
					placementId: null,
					title: li.name,
					description: (li.instructionalNotes ?? "").trim() || li.name,
					categoryKey: li.category,
					status,
					rejectionReason:
						status === CandidateComplianceStatus.REJECTED
							? (cc?.notes?.trim() ?? null)
							: null,
					uploadedAt: cc?.uploadedAt ? cc.uploadedAt.toISOString() : null,
					issuedAt: cc?.issueDate ? cc.issueDate.toISOString() : null,
					expiresAt: cc?.expiryDate ? cc.expiryDate.toISOString() : null,
					documentFileName: cc?.documentFileName ?? null,
					expirationType: li.expirationType,
					expirationRuleValue: li.expirationRuleValue,
					expirationRuleUnit: li.expirationRuleUnit,
					responseStyle: li.responseStyle,
					link: li.file,
				});
			}
			rows.sort(
				(a, b) =>
					getComplianceListItemCategoryLabel(a.categoryKey).localeCompare(
						getComplianceListItemCategoryLabel(b.categoryKey),
					) || a.title.localeCompare(b.title),
			);
			out.set(c.id, rows);
		}

		return out;
	}

	/**
	 * Resolves compliance list items from org document wallet templates for the
	 * candidate's occupation and (optional) org-linked specialties — not from placements.
	 */
	private async resolveTemplateComplianceListItems(
		organizationId: string,
		candidate: CandidateWalletKey,
	): Promise<Map<string, ComplianceListItem>> {
		const batch = await this.loadTemplateComplianceListItemsByCandidates(
			organizationId,
			[candidate],
		);
		return batch.get(candidate.id) ?? new Map();
	}

	private async buildWalletRowsForOrganizationAndCandidate(
		organizationId: string,
		candidate: CandidateWalletKey,
	): Promise<WalletRow[]> {
		const m = await this.buildWalletRowsForOrganizationAndCandidatesBatch(
			organizationId,
			[candidate],
		);
		return m.get(candidate.id) ?? [];
	}

	private async computeLiveWalletStats(
		organizationId: string,
		candidates: CandidateWalletKey[],
	): Promise<Map<string, LiveWalletStats>> {
		const out = new Map<string, LiveWalletStats>();
		if (candidates.length === 0) return out;

		const rowsByCandidate =
			await this.buildWalletRowsForOrganizationAndCandidatesBatch(
				organizationId,
				candidates,
			);

		for (const c of candidates) {
			const rows = rowsByCandidate.get(c.id) ?? [];
			let approved = 0;
			let pendingUpload = 0;
			let pendingVerification = 0;
			let expired = 0;
			for (const r of rows) {
				switch (r.status) {
					case CandidateComplianceStatus.APPROVED:
						approved += 1;
						break;
					case CandidateComplianceStatus.MISSING:
						pendingUpload += 1;
						break;
					case CandidateComplianceStatus.PENDING_REVIEW:
					case CandidateComplianceStatus.REJECTED:
						pendingVerification += 1;
						break;
					case CandidateComplianceStatus.EXPIRED:
						expired += 1;
						break;
				}
			}
			out.set(c.id, {
				walletTotalComplianceItems: rows.length,
				walletApprovedComplianceItems: approved,
				walletPendingUploadComplianceItems: pendingUpload,
				walletPendingVerificationComplianceItems: pendingVerification,
				walletExpiredComplianceItems: expired,
			});
		}

		return out;
	}

	async getVendorCandidateDocumentWalletSummary(
		organizationId: string,
		vendorId: string,
		candidateId: string,
	) {
		const row = await this.prisma.candidate.findFirst({
			where: {
				id: candidateId,
				organizationId,
				vendorId,
			},
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: {
					orderBy: { id: "asc" },
					select: {
						specialtyId: true,
						specialty: { select: { name: true, acronym: true } },
					},
				},
				user: {
					select: { name: true, email: true, phoneNumber: true },
				},
			},
		});
		if (!row) {
			throw new NotFoundException("Candidate not found.");
		}

		const candidate = {
			id: row.id,
			occupationId: row.occupationId,
			candidateSpecialties: row.candidateSpecialties.map((s) => ({
				specialtyId: s.specialtyId,
			})),
		};

		const liveStats = await this.computeLiveWalletStats(organizationId, [
			candidate,
		]);
		const stats =
			liveStats.get(candidate.id) ??
			({
				walletTotalComplianceItems: 0,
				walletApprovedComplianceItems: 0,
				walletPendingUploadComplianceItems: 0,
				walletPendingVerificationComplianceItems: 0,
				walletExpiredComplianceItems: 0,
			} satisfies LiveWalletStats);
		const total = stats.walletTotalComplianceItems;
		const approved = stats.walletApprovedComplianceItems;
		const approvedPercent =
			total > 0 ? Math.round((approved / total) * 100) : 100;

		const specialtyParts = row.candidateSpecialties.map((s) => {
			const n = s.specialty.name?.trim();
			const a = s.specialty.acronym?.trim();
			return n || a || "—";
		});
		const specialty =
			specialtyParts.length === 0
				? "—"
				: specialtyParts.length > 1
					? `${specialtyParts[0]} (+${specialtyParts.length - 1})`
					: specialtyParts[0];

		return {
			candidate: {
				id: row.id,
				name: row.user.name?.trim() || "—",
				email: row.user.email ?? "—",
				phone: row.user.phoneNumber?.trim() || null,
				specialty,
			},
			total,
			approved,
			approvedPercent,
			pendingVerification: stats.walletPendingVerificationComplianceItems,
			pendingUpload: stats.walletPendingUploadComplianceItems,
			expired: stats.walletExpiredComplianceItems,
		};
	}

	async getVendorCandidateDocumentWalletItems(
		organizationId: string,
		vendorId: string,
		candidateId: string,
		query: {
			page?: number;
			limit?: number;
			search?: string;
			categoryKey?: ComplianceListItemCategory;
		},
	) {
		const row = await this.prisma.candidate.findFirst({
			where: {
				id: candidateId,
				organizationId,
				vendorId,
			},
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!row) {
			throw new NotFoundException("Candidate not found.");
		}

		return this.getCandidateDocumentWalletItemsByCandidate(
			organizationId,
			row,
			query,
		);
	}

	private async getCandidateDocumentWalletItemsByCandidate(
		organizationId: string,
		candidate: {
			id: string;
			occupationId: string;
			candidateSpecialties: { specialtyId: string }[];
		},
		query: {
			page?: number;
			limit?: number;
			search?: string;
			categoryKey?: ComplianceListItemCategory;
		},
	) {
		const page = query.page ?? 1;
		const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
		const search = query.search?.trim().toLowerCase() ?? "";

		const allRows = await this.buildWalletRowsForOrganizationAndCandidate(
			organizationId,
			candidate,
		);

		let flat = allRows;
		if (query.categoryKey) {
			flat = flat.filter((r) => r.categoryKey === query.categoryKey);
		}
		if (search) {
			flat = flat.filter(
				(r) =>
					r.title.toLowerCase().includes(search) ||
					r.description.toLowerCase().includes(search),
			);
		}

		flat.sort(
			(a, b) =>
				getComplianceListItemCategoryLabel(a.categoryKey).localeCompare(
					getComplianceListItemCategoryLabel(b.categoryKey),
				) || a.title.localeCompare(b.title),
		);

		const total = flat.length;
		const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
		const safePage = Math.min(Math.max(page, 1), totalPages);
		const start = (safePage - 1) * limit;
		const slice = flat.slice(start, start + limit);

		type ItemRow = (typeof flat)[number];
		const byCat = new Map<string, { categoryKey: string; items: ItemRow[] }>();
		for (const row of slice) {
			const key = row.categoryKey;
			const cur = byCat.get(key) ?? {
				categoryKey: key,
				items: [] as ItemRow[],
			};
			cur.items.push(row);
			byCat.set(key, cur);
		}
		const categories = [...byCat.values()].sort((a, b) =>
			getComplianceListItemCategoryLabel(a.categoryKey).localeCompare(
				getComplianceListItemCategoryLabel(b.categoryKey),
			),
		);

		return {
			categories,
			page: safePage,
			limit,
			total,
			totalPages,
		};
	}

	async getVendorCandidateComplianceDocumentSignedUrl(
		organizationId: string,
		vendorId: string,
		candidateId: string,
		complianceListItemId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: {
				id: candidateId,
				organizationId,
				vendorId,
			},
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found.");
		}

		const allowedItems = await this.resolveTemplateComplianceListItems(
			organizationId,
			candidate,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new ForbiddenException("You don't have access to this document.");
		}

		const cc = await this.prisma.candidateCompliance.findUnique({
			where: {
				candidateId_complianceListItemId: {
					candidateId: candidate.id,
					complianceListItemId,
				},
			},
		});
		if (!cc?.documentUrl) {
			throw new NotFoundException("No document uploaded yet.");
		}

		const signedUrl = await this.filesService.getSignedUrl(cc.documentUrl);
		return { signedUrl };
	}

	/**
	 * Vendor review: approve, or send back for re-upload (reject).
	 * Reject uses {@link CandidateComplianceStatus.MISSING} with cleared file fields
	 * so the candidate UI returns to pending upload.
	 */
	async vendorUpdateCandidateComplianceStatus(
		organizationId: string,
		vendorId: string,
		candidateId: string,
		complianceListItemId: string,
		dto: UpdateCandidateComplianceStatusDto,
		userId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: {
				id: candidateId,
				organizationId,
				vendorId,
			},
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found.");
		}

		const allowedItems = await this.resolveTemplateComplianceListItems(
			organizationId,
			candidate,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new ForbiddenException(
				"Document is not part of this candidate wallet",
			);
		}

		const [existing, listItem] = await Promise.all([
			this.prisma.candidateCompliance.findUnique({
				where: {
					candidateId_complianceListItemId: {
						candidateId: candidate.id,
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

		if (dto.status === CandidateComplianceStatus.APPROVED) {
			if (!candidateHasActed) {
				throw new BadRequestException(
					isLinkItem
						? "Cannot approve until the candidate marks the link as submitted"
						: "Cannot approve without an uploaded document",
				);
			}
		}

		if (dto.status === CandidateComplianceStatus.REJECTED) {
			if (!candidateHasActed) {
				throw new BadRequestException(
					isLinkItem
						? "Cannot reject until the candidate marks the link as submitted"
						: "Cannot reject without an uploaded document",
				);
			}
			const reason = dto.notes?.trim() || null;
			await this.prisma.$transaction(async (tx) => {
				await tx.candidateCompliance.update({
					where: {
						candidateId_complianceListItemId: {
							candidateId: candidate.id,
							complianceListItemId,
						},
					},
					data: {
						status: CandidateComplianceStatus.REJECTED,
						notes: reason,
						verifiedById: null,
						verifiedAt: null,
					},
				});
			});
			await this.backgroundJobs.enqueueCandidateSummary(candidate.id);
			const affected = await this.prisma.placementComplianceItem.findMany({
				where: {
					complianceListItemId,
					removedAt: null,
					placement: { candidateId: candidate.id },
				},
				select: { placementId: true },
			});
			for (const row of affected) {
				await this.backgroundJobs.enqueueCredentialExpirySummaryForPlacement(
					row.placementId,
				);
			}
			return { success: true as const };
		}

		let expiryDate: Date | null = null;
		if (dto.expiryDate?.trim()) {
			const d = new Date(dto.expiryDate.trim());
			if (!Number.isNaN(d.getTime())) {
				expiryDate = d;
			}
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.candidateCompliance.upsert({
				where: {
					candidateId_complianceListItemId: {
						candidateId: candidate.id,
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
					candidateId: candidate.id,
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

		await this.backgroundJobs.enqueueCandidateSummary(candidate.id);
		const affected = await this.prisma.placementComplianceItem.findMany({
			where: {
				complianceListItemId,
				removedAt: null,
				placement: { candidateId: candidate.id },
			},
			select: { placementId: true },
		});
		for (const row of affected) {
			await this.backgroundJobs.enqueueCredentialExpirySummaryForPlacement(
				row.placementId,
			);
		}

		return { success: true as const };
	}

	async getCandidateDocumentWalletSummary(
		userId: string,
		organizationId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for organization",
			);
		}

		const liveStats = await this.computeLiveWalletStats(organizationId, [
			candidate,
		]);
		const stats =
			liveStats.get(candidate.id) ??
			({
				walletTotalComplianceItems: 0,
				walletApprovedComplianceItems: 0,
				walletPendingUploadComplianceItems: 0,
				walletPendingVerificationComplianceItems: 0,
				walletExpiredComplianceItems: 0,
			} satisfies LiveWalletStats);

		const total = stats.walletTotalComplianceItems;
		const approved = stats.walletApprovedComplianceItems;
		const approvedPercent =
			total > 0 ? Math.round((approved / total) * 100) : 100;
		return {
			total,
			approved,
			approvedPercent,
			pendingVerification: stats.walletPendingVerificationComplianceItems,
			pendingUpload: stats.walletPendingUploadComplianceItems,
			expired: stats.walletExpiredComplianceItems,
		};
	}

	async getCandidateDocumentWalletItems(
		userId: string,
		query: {
			organizationId: string;
			page?: number;
			limit?: number;
			search?: string;
			categoryKey?: ComplianceListItemCategory;
		},
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: query.organizationId },
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for organization",
			);
		}

		return this.getCandidateDocumentWalletItemsByCandidate(
			query.organizationId,
			candidate,
			query,
		);
	}

	async getCandidateDocumentWalletUploadOptions(
		userId: string,
		organizationId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for organization",
			);
		}

		// Summary-only mode: we don't rebuild wallet rows here.
		// This endpoint returns an empty list; rely on the wallet items endpoint for details.
		return [];
	}

	private resolveRequisitionAllowedComplianceItems(
		organizationId: string,
		requisitionId: string,
	): Promise<Set<string>> {
		return this.complianceWrite.listAllowedComplianceItemsForRequisition(
			organizationId,
			requisitionId,
		);
	}

	async markComplianceLinkSubmittedAsCandidate(
		userId: string,
		organizationId: string,
		complianceListItemId: string,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolveTemplateComplianceListItems(
			organizationId,
			candidate,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not part of your occupation document wallet for this organization",
			);
		}
		return this.performMarkLinkSubmitted(
			userId,
			candidate,
			complianceListItemId,
		);
	}

	async markComplianceLinkSubmittedForRequisitionAsCandidate(
		userId: string,
		organizationId: string,
		requisitionId: string,
		complianceListItemId: string,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolveRequisitionAllowedComplianceItems(
			organizationId,
			requisitionId,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not required by the selected job",
			);
		}
		return this.performMarkLinkSubmitted(
			userId,
			candidate,
			complianceListItemId,
		);
	}

	private async assertCandidateOwnsActivePlacement(
		organizationId: string,
		placementId: string,
		candidateId: string,
	): Promise<void> {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId, candidateId },
			select: { status: true },
		});
		if (!placement) {
			throw new NotFoundException("Placement not found.");
		}
		if (
			placement.status === PlacementStatus.COMPLETED ||
			placement.status === PlacementStatus.TERMINATED
		) {
			throw new BadRequestException(
				"This placement is no longer accepting compliance updates",
			);
		}
	}

	private async resolvePlacementAllowedComplianceItems(
		organizationId: string,
		placementId: string,
		candidateId: string,
	): Promise<Set<string>> {
		await this.assertCandidateOwnsActivePlacement(
			organizationId,
			placementId,
			candidateId,
		);
		return this.complianceWrite.listAllowedComplianceItemsForPlacement(
			organizationId,
			placementId,
		);
	}

	async uploadCandidateComplianceDocumentForPlacementAsCandidate(
		userId: string,
		organizationId: string,
		placementId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolvePlacementAllowedComplianceItems(
			organizationId,
			placementId,
			candidate.id,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not part of this placement",
			);
		}
		return this.performUpload(
			userId,
			organizationId,
			candidate,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
		);
	}

	async markComplianceLinkSubmittedForPlacementAsCandidate(
		userId: string,
		organizationId: string,
		placementId: string,
		complianceListItemId: string,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolvePlacementAllowedComplianceItems(
			organizationId,
			placementId,
			candidate.id,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not part of this placement",
			);
		}
		return this.performMarkLinkSubmitted(
			userId,
			candidate,
			complianceListItemId,
		);
	}

	private async resolveCandidateForUpload(
		userId: string,
		organizationId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: {
				id: true,
				occupationId: true,
				workforceType: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for organization",
			);
		}
		return candidate;
	}

	private async performMarkLinkSubmitted(
		userId: string,
		candidate: {
			id: string;
			workforceType: `${CandidateWorkforceType}` | null;
		},
		complianceListItemId: string,
	) {
		await this.complianceWrite.writeMarkLinkSubmitted({
			candidateId: candidate.id,
			workforceType: candidate.workforceType,
			complianceListItemId,
			userId,
		});
		await this.enqueueCandidateComplianceSideEffects(
			candidate.id,
			complianceListItemId,
		);
		return { success: true as const };
	}

	private async enqueueCandidateComplianceSideEffects(
		candidateId: string,
		complianceListItemId: string,
	) {
		await this.backgroundJobs.enqueueCandidateSummary(candidateId);
		const affected = await this.prisma.placementComplianceItem.findMany({
			where: {
				complianceListItemId,
				removedAt: null,
				placement: { candidateId },
			},
			select: { placementId: true },
		});
		for (const row of affected) {
			await this.backgroundJobs.enqueueCredentialExpirySummaryForPlacement(
				row.placementId,
			);
		}
	}

	async uploadCandidateComplianceDocumentAsCandidate(
		userId: string,
		organizationId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolveTemplateComplianceListItems(
			organizationId,
			candidate,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not part of your occupation document wallet for this organization",
			);
		}
		return this.performUpload(
			userId,
			organizationId,
			candidate,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
		);
	}

	async uploadCandidateComplianceDocumentAsVendor(
		userId: string,
		organizationId: string,
		vendorId: string,
		candidateId: string,
		requisitionId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId, vendorId },
			select: {
				id: true,
				occupationId: true,
				workforceType: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found for this vendor.");
		}
		const allowedItems = await this.resolveRequisitionAllowedComplianceItems(
			organizationId,
			requisitionId,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not required by the selected job",
			);
		}
		return this.performUpload(
			userId,
			organizationId,
			candidate,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
		);
	}

	async uploadCandidateComplianceDocumentForRequisitionAsCandidate(
		userId: string,
		organizationId: string,
		requisitionId: string,
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
	) {
		const candidate = await this.resolveCandidateForUpload(
			userId,
			organizationId,
		);
		const allowedItems = await this.resolveRequisitionAllowedComplianceItems(
			organizationId,
			requisitionId,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new NotFoundException(
				"This document is not required by the selected job",
			);
		}
		return this.performUpload(
			userId,
			organizationId,
			candidate,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
		);
	}

	private async performUpload(
		userId: string,
		organizationId: string,
		candidate: {
			id: string;
			workforceType: `${CandidateWorkforceType}` | null;
		},
		complianceListItemId: string,
		file: Express.Multer.File,
		expiryDateRaw: string | undefined,
		issueDateRaw: string | undefined,
	) {
		await this.complianceWrite.writeUpload({
			candidateId: candidate.id,
			workforceType: candidate.workforceType,
			complianceListItemId,
			file,
			expiryDateRaw,
			issueDateRaw,
			userId,
			s3KeyPath: `${organizationId}/candidate-wallet/${candidate.id}/${complianceListItemId}`,
		});
		await this.enqueueCandidateComplianceSideEffects(
			candidate.id,
			complianceListItemId,
		);
		return { success: true as const };
	}

	async getCandidateComplianceDocumentSignedUrl(
		userId: string,
		organizationId: string,
		complianceListItemId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for organization",
			);
		}

		const allowedItems = await this.resolveTemplateComplianceListItems(
			organizationId,
			candidate,
		);
		if (!allowedItems.has(complianceListItemId)) {
			throw new ForbiddenException("You don't have access to this document.");
		}

		const cc = await this.prisma.candidateCompliance.findUnique({
			where: {
				candidateId_complianceListItemId: {
					candidateId: candidate.id,
					complianceListItemId,
				},
			},
		});
		if (!cc?.documentUrl) {
			throw new NotFoundException("No document uploaded yet.");
		}

		const signedUrl = await this.filesService.getSignedUrl(cc.documentUrl);
		return { signedUrl };
	}

	private specialtyLabelForWalletList(
		rows: {
			specialty: { name: string; acronym: string | null };
		}[],
	): string {
		if (!rows.length) return "—";
		const first = rows[0];
		const base = first.specialty.name?.trim() || first.specialty.acronym || "—";
		if (rows.length > 1) return `${base} (+${rows.length - 1})`;
		return base;
	}

	private deriveVendorWalletListFromDocCounts(
		totalDocs: number,
		ok: number,
		pending: number,
		missing: number,
		warning: number,
	): {
		completedDocs: number;
		totalDocs: number;
		docCounts: {
			ok: number;
			pending: number;
			missing: number;
			warning: number;
		};
		status: VendorDocumentWalletListStatus;
	} {
		const completedDocs = ok;
		let status: VendorDocumentWalletListStatus;
		if (missing > 0 || warning > 0) {
			status = "CRITICAL";
		} else if (completedDocs === totalDocs) {
			status = "COMPLETE";
		} else {
			status = "IN_PROGRESS";
		}
		return {
			completedDocs,
			totalDocs,
			docCounts: { ok, pending, missing, warning },
			status,
		};
	}

	async getVendorDocumentWalletsMetrics(
		organizationId: string,
		vendorId: string,
	): Promise<VendorDocumentWalletMetricsDto> {
		const candidates = await this.prisma.candidate.findMany({
			where: { organizationId, vendorId },
			select: {
				id: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});

		if (candidates.length === 0) {
			return {
				totalCandidates: 0,
				complete: 0,
				inProgress: 0,
				critical: 0,
			};
		}

		const statsById = await this.fetchWalletStatsHybrid(
			organizationId,
			candidates,
		);

		let complete = 0;
		let inProgress = 0;
		let critical = 0;

		for (const c of candidates) {
			const stats = statsById.get(c.id);
			const derived = stats
				? this.deriveVendorWalletListFromDocCounts(
						stats.walletTotalComplianceItems,
						stats.walletApprovedComplianceItems,
						stats.walletPendingVerificationComplianceItems,
						stats.walletPendingUploadComplianceItems,
						stats.walletExpiredComplianceItems,
					)
				: this.deriveVendorWalletListFromDocCounts(0, 0, 0, 0, 0);
			if (derived.status === "COMPLETE") complete += 1;
			else if (derived.status === "CRITICAL") critical += 1;
			else inProgress += 1;
		}

		return {
			totalCandidates: candidates.length,
			complete,
			inProgress,
			critical,
		};
	}

	/**
	 * Hybrid wallet-stats fetch for a batch of candidates. Reads CandidateSummary
	 * for fresh rows; for missing or stale (>3 min) rows, recomputes live and
	 * fires an async refresh enqueue.
	 */
	private async fetchWalletStatsHybrid(
		organizationId: string,
		candidates: CandidateWalletKey[],
	): Promise<Map<string, LiveWalletStats>> {
		if (candidates.length === 0) return new Map();
		const candidateById = new Map(candidates.map((c) => [c.id, c]));

		return hybridSummaryFetch<string, LiveWalletStats>({
			scope: "wallet-stats",
			keys: candidates.map((c) => c.id),
			fetchSummaries: async (
				ids,
			): Promise<SummaryEntry<string, LiveWalletStats>[]> => {
				const rows = await this.prisma.candidateSummary.findMany({
					where: { candidateId: { in: ids } },
					select: {
						candidateId: true,
						walletTotalComplianceItems: true,
						walletApprovedComplianceItems: true,
						walletPendingUploadComplianceItems: true,
						walletPendingVerificationComplianceItems: true,
						walletExpiredComplianceItems: true,
						walletLastComplianceUpdatedAt: true,
					},
				});
				return rows.map((r) => ({
					key: r.candidateId,
					value: {
						walletTotalComplianceItems: r.walletTotalComplianceItems,
						walletApprovedComplianceItems: r.walletApprovedComplianceItems,
						walletPendingUploadComplianceItems:
							r.walletPendingUploadComplianceItems,
						walletPendingVerificationComplianceItems:
							r.walletPendingVerificationComplianceItems,
						walletExpiredComplianceItems: r.walletExpiredComplianceItems,
					},
					computedAt: r.walletLastComplianceUpdatedAt,
				}));
			},
			computeLive: async (staleIds) => {
				const staleCandidates = staleIds
					.map((id) => candidateById.get(id))
					.filter((c): c is CandidateWalletKey => c != null);
				return this.computeLiveWalletStats(organizationId, staleCandidates);
			},
			onStale: (staleIds) => {
				for (const id of staleIds) {
					void this.backgroundJobs
						.enqueueCandidateSummary(id)
						.catch(() => undefined);
				}
			},
		});
	}

	async listVendorDocumentWallets(
		organizationId: string,
		vendorId: string,
		query: QueryVendorDocumentWalletsDto,
	): Promise<PagePaginatedResponse<VendorDocumentWalletListRowDto>> {
		const search = query.search?.trim();
		const searchWhere: Prisma.CandidateWhereInput | undefined = search
			? {
					OR: [
						{
							user: {
								name: { contains: search, mode: "insensitive" },
							},
						},
						{
							user: {
								email: { contains: search, mode: "insensitive" },
							},
						},
						{
							candidateSpecialties: {
								some: {
									specialty: {
										OR: [
											{
												name: {
													contains: search,
													mode: "insensitive",
												},
											},
											{
												acronym: {
													contains: search,
													mode: "insensitive",
												},
											},
										],
									},
								},
							},
						},
					],
				}
			: undefined;

		const where: Prisma.CandidateWhereInput = {
			organizationId,
			vendorId,
			...(searchWhere ?? {}),
		};

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const statusFilter = query.status;

		if (statusFilter) {
			const allCandidates = await this.prisma.candidate.findMany({
				where,
				select: { ...VENDOR_WALLET_LIST_SELECT, occupationId: true },
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			});

			if (allCandidates.length === 0) {
				return { data: [], total: 0, page, limit, totalPages: 1 };
			}

			const statsById = await this.fetchWalletStatsHybrid(
				organizationId,
				allCandidates.map((c) => ({
					id: c.id,
					occupationId: c.occupationId,
					candidateSpecialties: c.candidateSpecialties.map((s) => ({
						specialtyId: s.specialtyId,
					})),
				})),
			);

			const allRows: VendorDocumentWalletListRowDto[] = allCandidates.map(
				(c) => {
					const stats = statsById.get(c.id);
					const derived = stats
						? this.deriveVendorWalletListFromDocCounts(
								stats.walletTotalComplianceItems,
								stats.walletApprovedComplianceItems,
								stats.walletPendingVerificationComplianceItems,
								stats.walletPendingUploadComplianceItems,
								stats.walletExpiredComplianceItems,
							)
						: this.deriveVendorWalletListFromDocCounts(0, 0, 0, 0, 0);
					return {
						id: c.id,
						name: c.user.name?.trim() || "—",
						email: c.user.email ?? "—",
						phone: c.user.phoneNumber?.trim() || null,
						specialty: this.specialtyLabelForWalletList(c.candidateSpecialties),
						...derived,
					};
				},
			);

			const filtered = allRows.filter((r) => r.status === statusFilter);
			const total = filtered.length;
			const skip = (page - 1) * limit;
			const data = filtered.slice(skip, skip + limit);
			const totalPages = Math.ceil(total / limit) || 1;
			return { data, total, page, limit, totalPages };
		}

		const skip = (page - 1) * limit;
		const total = await this.prisma.candidate.count({ where });

		if (total === 0) {
			return {
				data: [],
				total: 0,
				page,
				limit,
				totalPages: 1,
			};
		}

		const candidates = await this.prisma.candidate.findMany({
			where,
			select: { ...VENDOR_WALLET_LIST_SELECT, occupationId: true },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			skip,
			take: limit,
		});

		const statsById = await this.fetchWalletStatsHybrid(
			organizationId,
			candidates.map((c) => ({
				id: c.id,
				occupationId: c.occupationId,
				candidateSpecialties: c.candidateSpecialties.map((s) => ({
					specialtyId: s.specialtyId,
				})),
			})),
		);

		const data: VendorDocumentWalletListRowDto[] = candidates.map((c) => {
			const stats = statsById.get(c.id);
			const derived = stats
				? this.deriveVendorWalletListFromDocCounts(
						stats.walletTotalComplianceItems,
						stats.walletApprovedComplianceItems,
						stats.walletPendingVerificationComplianceItems,
						stats.walletPendingUploadComplianceItems,
						stats.walletExpiredComplianceItems,
					)
				: this.deriveVendorWalletListFromDocCounts(0, 0, 0, 0, 0);
			const name = c.user.name?.trim() || "—";
			const email = c.user.email ?? "—";
			const phone = c.user.phoneNumber?.trim() || null;
			const specialty = this.specialtyLabelForWalletList(
				c.candidateSpecialties,
			);
			return {
				id: c.id,
				name,
				email,
				phone,
				specialty,
				...derived,
			};
		});

		const totalPages = Math.ceil(total / limit) || 1;

		return {
			data,
			total,
			page,
			limit,
			totalPages,
		};
	}
}

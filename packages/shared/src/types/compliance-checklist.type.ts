import type { Prisma } from "@repo/db";

export type ComplianceChecklistItemType =
	Prisma.ComplianceChecklistItemGetPayload<{
		select: {
			id: true;
			checklistId: true;
			complianceListItemId: true;
			phase: true;
			createdAt: true;
			complianceListItem: {
				select: {
					id: true;
					name: true;
					category: true;
					expirationType: true;
					displayToCandidate: true;
					status: true;
				};
			};
		};
	}>;

export type ComplianceChecklistType = Prisma.ComplianceChecklistGetPayload<{
	select: {
		id: true;
		organizationId: true;
		name: true;
		description: true;
		isActive: true;
		createdById: true;
		updatedById: true;
		createdAt: true;
		updatedAt: true;
		items: {
			select: {
				id: true;
				checklistId: true;
				complianceListItemId: true;
				phase: true;
				createdAt: true;
				complianceListItem: {
					select: {
						id: true;
						name: true;
						category: true;
						expirationType: true;
						displayToCandidate: true;
						status: true;
					};
				};
			};
		};
		_count: {
			select: {
				requisitions: true;
				requisitionTemplates: true;
			};
		};
	};
}>;

export interface PaginatedComplianceChecklistsResponse {
	data: ComplianceChecklistType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

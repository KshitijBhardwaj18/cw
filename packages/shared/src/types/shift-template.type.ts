import type { Prisma } from "@repo/db";

export type ShiftTemplateListItem = Prisma.ShiftTemplateGetPayload<{
	select: {
		id: true;
		templateName: true;
		shiftType: true;
		occupationId: true;
		departmentId: true;
		locationId: true;
		durationHours: true;
		baseRate: true;
		baseBillRate: true;
		vendorRateMarkupPercent: true;
		limitShiftVisibility: true;
		visibilityUnlockDuration: true;
		visibilityUnlockUnit: true;
		offerIncentive: true;
		incentiveByHour: true;
		incentiveByShift: true;
		isActive: true;
		usageCount: true;
		createdAt: true;
		updatedAt: true;
		occupation: { select: { id: true; name: true; acronym: true } };
		department: { select: { id: true; name: true } };
		location: { select: { id: true; name: true } };
		createdBy: { select: { id: true; name: true } };
	};
}>;

export interface PaginatedShiftTemplatesResponse {
	data: ShiftTemplateListItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface OrgOccupationSpecialtyOption {
	id: string;
	specialtyId: string;
	name: string;
	acronym: string | null;
}

export interface OrgOccupationOption {
	id: string;
	organizationOccupationId: string;
	name: string;
	acronym: string;
	organizationSpecialties?: OrgOccupationSpecialtyOption[];
}

export interface OrgDepartmentOption {
	id: string;
	name: string;
	location: { id: string; name: string };
	/** Present when set on the department record (e.g. spend / filters). */
	costCenter?: string | null;
	departmentOccupations?: Array<{
		organizationOccupation: {
			id: string;
			occupation: { id: string; name: string; acronym: string | null };
		};
	}>;
	departmentSpecialties?: Array<{
		organizationSpecialty: {
			id: string;
			organizationOccupationId: string;
			specialty: { id: string; name: string; acronym: string | null };
		};
	}>;
}

export interface OrgLocationOption {
	id: string;
	name: string;
	city: string;
	state: string;
}

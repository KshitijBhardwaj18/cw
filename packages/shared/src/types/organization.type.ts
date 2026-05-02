import type { Prisma, User } from "@repo/db";

/** Organization location (matches organization_location table) */
export type OrganizationLocationType =
	Prisma.OrganizationLocationGetPayload<object>;

/** Organization with locations (matches organizations.service findAll) */
export type OrganizationResponseType = Prisma.OrganizationGetPayload<{
	include: {
		locations: true;
		_count: { select: { organizationVendors: true } };
	};
}>;

export interface PaginatedOrganizationsResponse {
	data: OrganizationResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Member row with nested user + vendorUser + vendor (returned by GET /organizations/:id/members) */
export type OrgMemberWithUserType = Prisma.MemberGetPayload<{
	include: {
		user: {
			include: {
				vendorUser: { include: { vendor: true } };
			};
		};
	};
}>;

export interface PaginatedOrgMembersResponse {
	data: OrgMemberWithUserType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CursorPaginatedResponse<T> {
	data: T[];
	nextCursor: string | null;
}

/** Vendor user available for enrollment (user whose vendor is linked to this org) */
export type OrgVendorUserType = User & {
	vendorUser: Prisma.VendorUserGetPayload<{
		include: { vendor: true };
	}>;
};

export interface GroupedOrganizationsResponse {
	groups: Array<{
		organizationType: string;
		data: OrganizationResponseType[];
		total: number;
	}>;
}

export interface PaginatedLocationsResponse {
	data: OrganizationLocationType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Department with location, occupation, specialty, and related users */
export type OrganizationDepartmentType = Prisma.DepartmentGetPayload<{
	include: {
		location: { select: { id: true; name: true } };
		organizationOccupation: {
			select: {
				id: true;
				occupation: {
					select: { id: true; name: true; acronym: true };
				};
			};
		};
		organizationSpecialty: {
			select: {
				id: true;
				specialty: {
					select: { id: true; name: true; acronym: true };
				};
			};
		};
		departmentUsers: {
			select: {
				user: {
					select: { id: true; name: true; email: true };
				};
			};
		};
	};
}>;

/** Department detail with timekeeping approvers (for edit dialog) */
export type OrganizationDepartmentDetailType = OrganizationDepartmentType & {
	departmentTimekeepingApprovers: Array<{
		user: { id: string; name: string | null; email: string };
	}>;
};

export interface PaginatedDepartmentsResponse {
	data: OrganizationDepartmentType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Organization vendor link with vendor details (returned by GET /organizations/:id/vendors) */
export type OrganizationVendorWithVendorType =
	Prisma.OrganizationVendorGetPayload<{
		include: {
			vendor: { select: { id: true; name: true; internalId: true } };
		};
	}>;

export interface PaginatedOrganizationVendorsResponse {
	data: OrganizationVendorWithVendorType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Minimal vendor shape for picker (GET /organizations/:id/available-vendors) */
export interface VendorPickerItem {
	id: string;
	name: string;
	internalId: string | null;
}

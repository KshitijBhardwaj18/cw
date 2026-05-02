import type { Prisma } from "@repo/db";
import type { VendorUserRole } from "@repo/shared";

export interface CreateVendorPayload {
	name: string;
	industries: string[];
	certifiedBusinessClassifications?: string[];
	about?: string;
	isActive?: boolean;
	internalId?: string;
	logoUrl?: string;
	taxId?: string;
	phoneNumber?: string;
	website?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	} | null;
	annualRevenue?: number | null;
	employeeCount?: number | null;
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

export interface SetOccupationsPayload {
	occupationIds: string[];
}

export interface AddVendorUserPayload {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone?: string;
	mobilePhone?: string;
	status?: string;
	role?: VendorUserRole;
}

export interface UpdateVendorUserPayload {
	firstName: string;
	lastName: string;
	title: string;
	officePhone?: string | null;
	phoneNumber?: string | null;
	status: string;
	role: VendorUserRole;
}

export interface AddDocumentPayload {
	name: string;
	type: string;
	url: string;
	description?: string;
}

export interface AddNotePayload {
	type: string;
	notes: string;
}

const vendorListInclude = {
	address: true,
	vendorOccupationSpecializations: { include: { occupation: true } },
	vendorUsers: { include: { user: true } },
	_count: { select: { documents: true, notes: true } },
} as const satisfies Prisma.VendorInclude;

export type Vendor = Prisma.VendorGetPayload<{
	include: typeof vendorListInclude;
}>;

const vendorDetailInclude = {
	address: true,
	vendorOccupationSpecializations: { include: { occupation: true } },
	vendorUsers: { include: { user: true } },
	documents: true,
	notes: true,
	organizationVendors: { include: { organization: true } },
} as const satisfies Prisma.VendorInclude;

export type VendorDetail = Prisma.VendorGetPayload<{
	include: typeof vendorDetailInclude;
}>;

export type VendorTableRowType = Vendor;

export type VendorColumnsCallbacks = {
	onEdit?: (row: VendorTableRowType) => void;
	onDelete?: (row: VendorTableRowType) => void;
	actions?: React.ReactNode;
};

export type VendorDocumentWithUser = Prisma.DocumentGetPayload<{
	include: { user: true };
}>;

export type VendorNoteWithDetails = Prisma.NoteGetPayload<{
	include: {
		user: true;
		vendor: {
			include: {
				organizationVendors: { include: { organization: true } };
			};
		};
	};
}>;

/** Note with user; supports vendor, msp, or organization context */
export type NoteWithUser = Prisma.NoteGetPayload<{
	include: { user: true };
}>;

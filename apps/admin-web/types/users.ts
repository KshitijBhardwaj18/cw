import type { Member, Organization, User, Vendor, VendorUser } from "@repo/db";
import type {
	BulkEnrollmentJobResult,
	MemberRole,
	UserRole,
	UserStatus,
	VendorUserRole,
} from "@repo/shared";

export type VendorDto = Vendor;

export type MspOptionDto = {
	id: string;
	name: string;
};

export type VendorUserDto = VendorUser & {
	vendor?: VendorDto | null;
};

export type UserDto = User & {
	vendorUser?: VendorUserDto | null;
	members?: OrgMemberDto[] | null;
};

export type OrgMemberDto = Member & {
	organization?: Organization | null;
};

export type OrganizationDto = Organization;

export type CreateProgramUserInput = {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone: string;
	phoneNumber: string;
	role: UserRole;
	status: UserStatus;
	mspId: string | null;
};

export type CreateProgramUsersInput = {
	users: CreateProgramUserInput[];
};

export type EditProgramUserInput = {
	firstName: string;
	lastName: string;
	title: string;
	officePhone: string | null;
	phoneNumber: string | null;
	role: UserRole;
	status: UserStatus;
	mspId: string | null;
};

export type OrganizationUserTableRow = {
	id: string;
	organizationId: string;
	organizationName: string;
	firstName: string;
	lastName: string;
	title: string | null;
	email: string;
	officePhone: string | null;
	phoneNumber: string | null;
	role: UserRole;
	status: UserStatus;
};

export type VendorUserTableRow = {
	id: string;
	vendorId: string;
	vendorName: string;
	firstName: string;
	lastName: string;
	title: string | null;
	email: string;
	officePhone: string | null;
	phoneNumber: string | null;
	role: VendorUserRole;
	status: UserStatus;
};

export type PlatformUserTableRow = {
	id: string;
	firstName: string;
	lastName: string;
	title: string | null;
	email: string;
	officePhone: string | null;
	phoneNumber: string | null;
	role: UserRole;
	status: UserStatus;
};

export type BulkImportUserRow = {
	id: string;
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone: string;
	phoneNumber: string;
	role: UserRole;
	status: UserStatus;
	mspId: string | null;
};

export type EnrollOrgUserInput = {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone?: string;
	phoneNumber?: string;
	role: MemberRole;
};

export type EnrollExistingUserInput = {
	userId: string;
};

export type EnrolledOrganizationUserRow = {
	id: string;
	memberId: string;
	name: string;
	email: string;
	title: string | null;
	role: string;
	status: string;
	inviteStatus: string;
};

export type EnrolledProgramUserRow = {
	id: string;
	memberId: string;
	name: string;
	email: string;
	title: string | null;
	organizationRole: string;
	inviteStatus: string;
};

export type EnrolledVendorUserRow = {
	id: string;
	memberId: string;
	vendorName: string;
	name: string;
	email: string;
	title: string | null;
	organizationRole: string;
	inviteStatus: string;
};

export type EnrolledCandidateRow = {
	id: string;
	name: string;
	email: string;
	occupation: string;
	workforceType: string | null;
	vendorName: string | null;
	source: string | null;
	inviteStatus: string | null;
	isActive: boolean;
	createdAt: string;
};

export type BulkEnrollmentJobResponse = {
	id: string;
	type: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	payload?: object;
	result?: Partial<BulkEnrollmentJobResult>;
	createdAt: string;
	updatedAt: string;
	completedAt?: string | null;
};

export type BulkPlatformUsersJobResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: Array<{ row: number; email?: string; message: string }>;
};

export type BulkPlatformUsersJobResponse = {
	id: string;
	type: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	payload?: object;
	result?: Partial<BulkPlatformUsersJobResult>;
	createdAt: string;
	updatedAt: string;
	completedAt?: string | null;
};

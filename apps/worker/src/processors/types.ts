export type BulkEnrollUserPayload = {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone?: string;
	phoneNumber?: string;
	role: string;
};

export type BulkEnrollmentJobPayload = {
	jobId: string;
	organizationId: string;
	users: BulkEnrollUserPayload[];
};

export type BulkPlatformUserRow = {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	officePhone?: string;
	phoneNumber?: string;
	role: string;
	status: string;
};

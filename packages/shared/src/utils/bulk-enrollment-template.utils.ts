const TEMPLATE_HEADERS = [
	"First Name",
	"Last Name",
	"Job Title",
	"Email",
	"Office Phone",
	"Mobile Phone",
	"Organization Role",
	"Notes",
] as const;

export const ORGANIZATION_BULK_ENROLLMENT_TEMPLATE_FILENAME =
	"organization-enrollment-template.csv";

export function buildOrganizationBulkEnrollmentTemplateCsv(): string {
	const example = [
		"Jane",
		"Doe",
		"Operations Lead",
		"jane.doe@example.com",
		"+1 555 0100",
		"+1 555 0101",
		"EXECUTIVE",
		"Optional notes",
	];
	return [TEMPLATE_HEADERS.join(","), example.join(",")].join("\n");
}

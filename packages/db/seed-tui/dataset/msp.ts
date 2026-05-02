import {
	DocumentType,
	MSPOrganizationType,
	NoteType,
	OrganizationIndustry,
	OrganizationTimezone,
} from "@repo/db";
import { getDeterministicId, SAMPLE_PDF_URL, SEED_PREFIX } from "../utils";

export const MSP_ID = {
	QUANTUM: getDeterministicId(`${SEED_PREFIX}msp-quantum-innovation`),
	FIREWALL: getDeterministicId(`${SEED_PREFIX}msp-firewall-security`),
	GREENLEAF: getDeterministicId(`${SEED_PREFIX}msp-greenleaf-it`),
	SECURECORE: getDeterministicId(`${SEED_PREFIX}msp-securecore-msp`),
	APEX: getDeterministicId(`${SEED_PREFIX}msp-apex-solutions-inc.`),
	BLUEWAVE: getDeterministicId(`${SEED_PREFIX}msp-bluewave-technology`),
	GLOBALTECH: getDeterministicId(`${SEED_PREFIX}msp-globaltech-solutions`),
	BRIGHTSTAR: getDeterministicId(`${SEED_PREFIX}msp-brightstar-network`),
} as const;

export const MSP_ADDR_ID = {
	QUANTUM: getDeterministicId(`${SEED_PREFIX}msp-address-quantum-innovation`),
	FIREWALL: getDeterministicId(`${SEED_PREFIX}msp-address-firewall-security`),
	GREENLEAF: getDeterministicId(`${SEED_PREFIX}msp-address-greenleaf-it`),
	SECURECORE: getDeterministicId(`${SEED_PREFIX}msp-address-securecore-msp`),
	APEX: getDeterministicId(`${SEED_PREFIX}msp-address-apex-solutions-inc.`),
	BLUEWAVE: getDeterministicId(`${SEED_PREFIX}msp-address-bluewave-technology`),
	GLOBALTECH: getDeterministicId(
		`${SEED_PREFIX}msp-address-globaltech-solutions`,
	),
	BRIGHTSTAR: getDeterministicId(
		`${SEED_PREFIX}msp-address-brightstar-network`,
	),
} as const;

export const getMSPDataset = () => {
	const msps = [
		{
			id: MSP_ID.QUANTUM,
			addressId: MSP_ADDR_ID.QUANTUM,
			name: "Quantum Innovation",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.ORGANIZATION_STAFFING_OFFICE,
			phoneNumber: "(303) 555-1234",
			timeZone: OrganizationTimezone.MOUNTAIN,
			msaDocument: SAMPLE_PDF_URL,
			msaFileName: "Quantum_MSA_2023.pdf",
			msaAgreementRevisionDate: new Date("2024-08-12"),
			address: {
				street: "258 Future St",
				city: "Denver",
				state: "Colorado",
				zipCode: "80231",
				country: "United States",
			},
			documents: [
				{
					name: "Contract_2023_Q4.pdf",
					type: DocumentType.LEGAL,
					description: "Quarterly sales contract for Q4 2023.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2023-11-28"),
				},
				{
					name: "Marketing_Strategy.pdf",
					type: DocumentType.MARKETING,
					description: "Annual marketing strategy document.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2023-11-27"),
				},
				{
					name: "Financial_Report.xlsx",
					type: DocumentType.FINANCE,
					description: "Monthly financial report for November.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2023-11-26"),
				},
			],
			notes: [
				{
					type: NoteType.GENERAL,
					notes: "Meeting notes on project alpha progress.",
					createdAt: new Date("2023-11-20"),
				},
				{
					type: NoteType.BILLING,
					notes: "Reviewed code for module X. Found minor issues.",
					createdAt: new Date("2023-11-19"),
				},
				{
					type: NoteType.ISSUE,
					notes: "Security patch required for production server ASAP.",
					createdAt: new Date("2023-11-18"),
				},
				{
					type: NoteType.GENERAL,
					notes: "Followed up with client regarding deliverables.",
					createdAt: new Date("2023-11-17"),
				},
				{
					type: NoteType.REQUEST,
					notes: "Prepared documentation for API endpoints.",
					createdAt: new Date("2023-11-16"),
				},
			],
			links: [
				{
					name: "Vitality Health Group",
					mspFeePercentage: 5.25,
					saasFeePercentage: 2.25,
					startDate: new Date("2024-02-01"),
					renewalDate: new Date("2025-02-01"),
					possibleCancellationDate: new Date("2025-01-01"),
					expectedMSPRevenue: 200000,
					expectedSASRevenue: 72000,
				},
				{
					name: "Nova Health",
					mspFeePercentage: 7.5,
					saasFeePercentage: 2.75,
					startDate: new Date("2024-01-15"),
					renewalDate: new Date("2025-01-15"),
					possibleCancellationDate: new Date("2024-12-15"),
					expectedMSPRevenue: 187500,
					expectedSASRevenue: 68750,
				},
			],
		},
		{
			id: MSP_ID.FIREWALL,
			addressId: MSP_ADDR_ID.FIREWALL,
			name: "Firewall Security",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.CORPORATE_OFFICE,
			phoneNumber: "(206) 555-0199",
			timeZone: OrganizationTimezone.PACIFIC,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "123 Secure Way",
				city: "Seattle",
				state: "WA",
				zipCode: "98101",
				country: "United States",
			},
			documents: [
				{
					name: "Security_Audit_2023.pdf",
					type: DocumentType.LEGAL,
					description: "Annual security compliance audit.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2023-05-22"),
				},
			],
			notes: [
				{
					type: NoteType.GENERAL,
					notes: "Initial setup complete.",
					createdAt: new Date("2023-05-22"),
				},
			],
		},
		{
			id: MSP_ID.GREENLEAF,
			addressId: MSP_ADDR_ID.GREENLEAF,
			name: "GreenLeaf IT",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.BRANCH_OFFICE,
			phoneNumber: "(512) 555-0123",
			timeZone: OrganizationTimezone.CENTRAL,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "456 Tech Blvd",
				city: "Austin",
				state: "TX",
				zipCode: "78701",
				country: "United States",
			},
			documents: [
				{
					name: "SLA_Agreement.pdf",
					type: DocumentType.LEGAL,
					description: "Standard service level agreement.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2022-01-20"),
				},
			],
			notes: [
				{
					type: NoteType.BILLING,
					notes: "Consolidated billing enabled.",
					createdAt: new Date("2022-02-15"),
				},
			],
		},
		{
			id: MSP_ID.SECURECORE,
			addressId: MSP_ADDR_ID.SECURECORE,
			name: "SecureCore MSP",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.CORPORATE_OFFICE,
			phoneNumber: "(617) 555-0188",
			timeZone: OrganizationTimezone.EASTERN,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "789 Guard St",
				city: "Boston",
				state: "MA",
				zipCode: "02108",
				country: "United States",
			},
			documents: [
				{
					name: "Compliance_Certificate.pdf",
					type: DocumentType.LEGAL,
					description: "Cybersecurity insurance certificate.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2021-09-01"),
				},
			],
			notes: [
				{
					type: NoteType.GENERAL,
					notes: "Primary security provider for East Coast.",
					createdAt: new Date("2021-09-05"),
				},
			],
		},
		{
			id: MSP_ID.APEX,
			addressId: MSP_ADDR_ID.APEX,
			name: "Apex Solutions Inc.",
			industry: OrganizationIndustry.OTHER,
			organizationType: MSPOrganizationType.ORGANIZATION_STAFFING_OFFICE,
			phoneNumber: "(212) 555-0155",
			timeZone: OrganizationTimezone.EASTERN,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "101 Peak Ave",
				city: "New York",
				state: "NY",
				zipCode: "10001",
				country: "United States",
			},
			documents: [
				{
					name: "Executive_Summary_2023.pdf",
					type: DocumentType.FINANCE,
					description: "Annual executive performance summary.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2021-03-15"),
				},
			],
			notes: [
				{
					type: NoteType.GENERAL,
					notes: "Expanding operations to mid-size markets.",
					createdAt: new Date("2021-04-01"),
				},
			],
		},
		{
			id: MSP_ID.BLUEWAVE,
			addressId: MSP_ADDR_ID.BLUEWAVE,
			name: "BlueWave Technology",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.BRANCH_OFFICE,
			phoneNumber: "(415) 555-0177",
			timeZone: OrganizationTimezone.PACIFIC,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "202 Ocean Dr",
				city: "San Francisco",
				state: "CA",
				zipCode: "94105",
				country: "United States",
			},
			documents: [
				{
					name: "MSA_BlueWave_Final.pdf",
					type: DocumentType.LEGAL,
					description: "Final signed master services agreement.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2020-11-01"),
				},
			],
			notes: [
				{
					type: NoteType.REQUEST,
					notes: "Requesting additional API integration documentation.",
					createdAt: new Date("2023-10-20"),
				},
			],
		},
		{
			id: MSP_ID.GLOBALTECH,
			addressId: MSP_ADDR_ID.GLOBALTECH,
			name: "GlobalTech Solutions",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.REMOTE_OFFICE,
			phoneNumber: "(214) 555-0166",
			timeZone: OrganizationTimezone.CENTRAL,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "303 Planet Way",
				city: "Dallas",
				state: "TX",
				zipCode: "75201",
				country: "United States",
			},
			documents: [
				{
					name: "GlobalTech_Portfolio.pdf",
					type: DocumentType.MARKETING,
					description: "Corporate capabilities portfolio.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2020-04-01"),
				},
			],
			notes: [
				{
					type: NoteType.BILLING,
					notes: "Switching to net-60 payment terms.",
					createdAt: new Date("2023-09-12"),
				},
			],
		},
		{
			id: MSP_ID.BRIGHTSTAR,
			addressId: MSP_ADDR_ID.BRIGHTSTAR,
			name: "BrightStar Network",
			industry: OrganizationIndustry.TECHNOLOGY,
			organizationType: MSPOrganizationType.ORGANIZATION_STAFFING_OFFICE,
			phoneNumber: "(312) 555-0144",
			timeZone: OrganizationTimezone.CENTRAL,
			msaDocument: SAMPLE_PDF_URL,
			address: {
				street: "404 Light St",
				city: "Chicago",
				state: "IL",
				zipCode: "60601",
				country: "United States",
			},
			documents: [
				{
					name: "Partnership_Agreement.pdf",
					type: DocumentType.LEGAL,
					description: "Master partnership agreement.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2019-07-10"),
				},
				{
					name: "Quarterly_Review_Q3.pdf",
					type: DocumentType.MARKETING,
					description: "Performance review for Q3.",
					url: SAMPLE_PDF_URL,
					uploadedAt: new Date("2023-10-15"),
				},
			],
			notes: [
				{
					type: NoteType.GENERAL,
					notes: "Long-standing partner with high satisfaction.",
					createdAt: new Date("2019-07-11"),
				},
				{
					type: NoteType.ISSUE,
					notes: "Occasional delays in reporting.",
					createdAt: new Date("2023-11-01"),
				},
			],
		},
	];

	return msps;
};

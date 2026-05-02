import { OrganizationIndustry, OrganizationVendorStatus } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import type { OccupationAcronym } from "./occupations";

export const VENDOR_ID = {
	ALLIED: getDeterministicId(`${SEED_PREFIX}vendor-allied`),
	CAREFIRST: getDeterministicId(`${SEED_PREFIX}vendor-carefirst`),
	ELITE: getDeterministicId(`${SEED_PREFIX}vendor-elite`),
	GLOBAL: getDeterministicId(`${SEED_PREFIX}vendor-global`),
	HEALTHPRO: getDeterministicId(`${SEED_PREFIX}vendor-healthpro`),
	MEDSTAFF: getDeterministicId(`${SEED_PREFIX}vendor-medstaff`),
	NOVA: getDeterministicId(`${SEED_PREFIX}vendor-nova`),
	NURSECONNECT: getDeterministicId(`${SEED_PREFIX}vendor-nurseconnect`),
	PREMIER: getDeterministicId(`${SEED_PREFIX}vendor-premier`),
	REGIONAL: getDeterministicId(`${SEED_PREFIX}vendor-regional`),
} as const;

export const getVendorsDataset = (): {
	id: string;
	name: string;
	isActive: boolean;
	internalId: string;
	industries: OrganizationIndustry[];
	annualRevenue: number;
	employeeCount: number;
	website: string;
	phoneNumber: string;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	orgVendor: {
		status: OrganizationVendorStatus;
		startDate: Date;
	};
	specializations?: OccupationAcronym[];
}[] => {
	const vendors: ReturnType<typeof getVendorsDataset> = [
		{
			id: VENDOR_ID.ALLIED,
			name: "Allied Health Partners",
			isActive: false,
			internalId: `${SEED_PREFIX}vendor-allied`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 25000000,
			employeeCount: 300,
			website: "https://alliedhealth.test.com",
			phoneNumber: "+16029081234",
			address: {
				street: "994 Tustin Avenue",
				city: "Seattle",
				state: "WA",
				zipCode: "98101",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-06-12"),
			},
			specializations: ["CNA", "LPN"],
		},
		{
			id: VENDOR_ID.CAREFIRST,
			name: "CareFirst Staffing",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-carefirst`,
			industries: [OrganizationIndustry.HEALTHCARE, OrganizationIndustry.OTHER],
			annualRevenue: 12000000,
			employeeCount: 150,
			website: "https://carefirst.test.com",
			phoneNumber: "+14155550101",
			address: {
				street: "101 Market St",
				city: "San Francisco",
				state: "CA",
				zipCode: "94105",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-02-01"),
			},
			specializations: ["RN", "NP"],
		},
		{
			id: VENDOR_ID.ELITE,
			name: "Elite Nursing Services",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-elite`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 8000000,
			employeeCount: 80,
			website: "https://elitenursing.test.com",
			phoneNumber: "+12125550202",
			address: {
				street: "500 5th Ave",
				city: "New York",
				state: "NY",
				zipCode: "10110",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-10-20"),
			},
			specializations: ["RN", "LPN"],
		},
		{
			id: VENDOR_ID.GLOBAL,
			name: "Global Healthcare Resources",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-global`,
			industries: [
				OrganizationIndustry.HEALTHCARE,
				OrganizationIndustry.TECHNOLOGY,
			],
			annualRevenue: 50000000,
			employeeCount: 500,
			website: "https://globalhr.test.com",
			phoneNumber: "+13125550303",
			address: {
				street: "233 S Wacker Dr",
				city: "Chicago",
				state: "IL",
				zipCode: "60606",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-08-10"),
			},
			specializations: ["MA", "RN"],
		},
		{
			id: VENDOR_ID.HEALTHPRO,
			name: "HealthPro Recruiters",
			isActive: false,
			internalId: `${SEED_PREFIX}vendor-healthpro`,
			industries: [
				OrganizationIndustry.HEALTHCARE,
				OrganizationIndustry.FINANCE,
			],
			annualRevenue: 5000000,
			employeeCount: 40,
			website: "https://healthpro.test.com",
			phoneNumber: "+13055550404",
			address: {
				street: "701 Brickell Ave",
				city: "Miami",
				state: "FL",
				zipCode: "33131",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.PENDING,
				startDate: new Date("2023-04-10"),
			},
		},
		{
			id: VENDOR_ID.MEDSTAFF,
			name: "MedStaff Solutions",
			isActive: false,
			internalId: `${SEED_PREFIX}vendor-medstaff`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 15000000,
			employeeCount: 200,
			website: "https://medstaff.test.com",
			phoneNumber: "+12065550505",
			address: {
				street: "1201 3rd Ave",
				city: "Seattle",
				state: "WA",
				zipCode: "98101",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-03-20"),
			},
		},
		{
			id: VENDOR_ID.NOVA,
			name: "Nova Health",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-nova`,
			industries: [
				OrganizationIndustry.HEALTHCARE,
				OrganizationIndustry.MANUFACTURING,
			],
			annualRevenue: 30000000,
			employeeCount: 350,
			website: "https://novahealth-vendor.test.com",
			phoneNumber: "+16175550606",
			address: {
				street: "100 Federal St",
				city: "Boston",
				state: "MA",
				zipCode: "02110",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2025-01-15"),
			},
		},
		{
			id: VENDOR_ID.NURSECONNECT,
			name: "NurseConnect Agency",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-nurseconnect`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 6000000,
			employeeCount: 60,
			website: "https://nurseconnect.test.com",
			phoneNumber: "+12135550707",
			address: {
				street: "633 W 5th St",
				city: "Los Angeles",
				state: "CA",
				zipCode: "90071",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-05-05"),
			},
		},
		{
			id: VENDOR_ID.PREMIER,
			name: "Premier Medical Staffing",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-premier`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 20000000,
			employeeCount: 250,
			website: "https://premiermed.test.com",
			phoneNumber: "+14045550808",
			address: {
				street: "191 Peachtree St NE",
				city: "Atlanta",
				state: "GA",
				zipCode: "30303",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-07-19"),
			},
		},
		{
			id: VENDOR_ID.REGIONAL,
			name: "Regional Medical Staffing",
			isActive: true,
			internalId: `${SEED_PREFIX}vendor-regional`,
			industries: [OrganizationIndustry.HEALTHCARE],
			annualRevenue: 10000000,
			employeeCount: 120,
			website: "https://regionalmed.test.com",
			phoneNumber: "+12145550909",
			address: {
				street: "1717 Main St",
				city: "Dallas",
				state: "TX",
				zipCode: "75201",
				country: "USA",
			},
			orgVendor: {
				status: OrganizationVendorStatus.ACTIVE,
				startDate: new Date("2023-09-15"),
			},
		},
	];

	return vendors;
};

import { LocationType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const LOCATION_ID = {
	MAIN: getDeterministicId(`${SEED_PREFIX}location-main`),
	DOWNTOWN: getDeterministicId(`${SEED_PREFIX}location-downtown`),
	URGENT: getDeterministicId(`${SEED_PREFIX}location-urgent`),
	REHAB: getDeterministicId(`${SEED_PREFIX}location-rehab`),
} as const;

export const getLocationsDataset = (organizationId: string) => [
	{
		id: LOCATION_ID.MAIN,
		organizationId,
		name: "Main Campus",
		address: "123 Medical Center Dr",
		city: "Springfield",
		state: "IL",
		zipCode: "62701",
		locationType: LocationType.BRANCH,
		phone: "+15551234567",
	},
	{
		id: LOCATION_ID.DOWNTOWN,
		organizationId,
		name: "Downtown Clinic",
		address: "456 Health St",
		city: "Springfield",
		state: "IL",
		zipCode: "62702",
		locationType: LocationType.SATELLITE,
		phone: "+15551234568",
	},
	{
		id: LOCATION_ID.URGENT,
		organizationId,
		name: "Nova Urgent Care",
		address: "789 Fast Track Way",
		city: "Springfield",
		state: "IL",
		zipCode: "62703",
		locationType: LocationType.SATELLITE,
		phone: "+15551234569",
	},
	{
		id: LOCATION_ID.REHAB,
		organizationId,
		name: "Nova Rehabilitation Center",
		address: "321 Recovery Blvd",
		city: "Springfield",
		state: "IL",
		zipCode: "62704",
		locationType: LocationType.SATELLITE,
		phone: "+15551234570",
	},
];

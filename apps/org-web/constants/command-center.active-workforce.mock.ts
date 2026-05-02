import type {
	ActiveWorkforceCountsResponse,
	ActiveWorkforceOccupationsResponse,
} from "@/types/command-center";

export const MOCK_ACTIVE_WORKFORCE_OCCUPATIONS_RESPONSE: ActiveWorkforceOccupationsResponse =
	{
		data: [
			{ id: "all", name: "All Occupations" },
			{ id: "registered-nurse", name: "Registered Nurse" },
			{ id: "licensed-practical-nurse", name: "Licensed Practical Nurse" },
			{
				id: "certified-nursing-assistant",
				name: "Certified Nursing Assistant",
			},
			{ id: "physical-therapist", name: "Physical Therapist" },
			{ id: "occupational-therapist", name: "Occupational Therapist" },
			{ id: "respiratory-therapist", name: "Respiratory Therapist" },
			{ id: "medical-technician", name: "Medical Technician" },
			{ id: "radiologic-technologist", name: "Radiologic Technologist" },
		],
	};

export const MOCK_ACTIVE_WORKFORCE_COUNTS_RESPONSE: ActiveWorkforceCountsResponse =
	{
		data: [
			{
				occupationId: "all",
				counts: {
					"internal-full-time": 145,
					"internal-part-time": 68,
					"internal-prn": 52,
					"internal-float-pool": 34,
					"internal-volunteer": 12,
					"external-1099": 89,
					"external-eor": 156,
					"external-vendor-per-diem": 203,
					"external-vendor-lto": 97,
				},
			},
			{
				occupationId: "registered-nurse",
				counts: {
					"internal-full-time": 72,
					"internal-part-time": 28,
					"internal-prn": 20,
					"internal-float-pool": 10,
					"internal-volunteer": 4,
					"external-1099": 31,
					"external-eor": 58,
					"external-vendor-per-diem": 76,
					"external-vendor-lto": 40,
				},
			},
			{
				occupationId: "licensed-practical-nurse",
				counts: {
					"internal-full-time": 24,
					"internal-part-time": 13,
					"internal-prn": 10,
					"internal-float-pool": 6,
					"internal-volunteer": 2,
					"external-1099": 14,
					"external-eor": 26,
					"external-vendor-per-diem": 35,
					"external-vendor-lto": 18,
				},
			},
			{
				occupationId: "certified-nursing-assistant",
				counts: {
					"internal-full-time": 18,
					"internal-part-time": 9,
					"internal-prn": 8,
					"internal-float-pool": 4,
					"internal-volunteer": 1,
					"external-1099": 11,
					"external-eor": 22,
					"external-vendor-per-diem": 27,
					"external-vendor-lto": 13,
				},
			},
			{
				occupationId: "physical-therapist",
				counts: {
					"internal-full-time": 10,
					"internal-part-time": 6,
					"internal-prn": 4,
					"internal-float-pool": 3,
					"internal-volunteer": 1,
					"external-1099": 8,
					"external-eor": 14,
					"external-vendor-per-diem": 19,
					"external-vendor-lto": 9,
				},
			},
			{
				occupationId: "occupational-therapist",
				counts: {
					"internal-full-time": 8,
					"internal-part-time": 4,
					"internal-prn": 3,
					"internal-float-pool": 2,
					"internal-volunteer": 1,
					"external-1099": 6,
					"external-eor": 11,
					"external-vendor-per-diem": 15,
					"external-vendor-lto": 7,
				},
			},
			{
				occupationId: "respiratory-therapist",
				counts: {
					"internal-full-time": 6,
					"internal-part-time": 3,
					"internal-prn": 3,
					"internal-float-pool": 2,
					"internal-volunteer": 1,
					"external-1099": 6,
					"external-eor": 9,
					"external-vendor-per-diem": 13,
					"external-vendor-lto": 6,
				},
			},
			{
				occupationId: "medical-technician",
				counts: {
					"internal-full-time": 4,
					"internal-part-time": 3,
					"internal-prn": 2,
					"internal-float-pool": 2,
					"internal-volunteer": 1,
					"external-1099": 5,
					"external-eor": 8,
					"external-vendor-per-diem": 10,
					"external-vendor-lto": 5,
				},
			},
			{
				occupationId: "radiologic-technologist",
				counts: {
					"internal-full-time": 3,
					"internal-part-time": 2,
					"internal-prn": 2,
					"internal-float-pool": 1,
					"internal-volunteer": 1,
					"external-1099": 4,
					"external-eor": 8,
					"external-vendor-per-diem": 8,
					"external-vendor-lto": 4,
				},
			},
		],
	};

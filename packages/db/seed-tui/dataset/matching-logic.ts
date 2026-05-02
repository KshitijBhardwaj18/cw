import { MatchingCriterionKey } from "../../generated/prisma";

export const getMatchingLogicDataset = () => {
	return [
		{
			key: MatchingCriterionKey.PREFERRED_LOCATION,
			name: "Preferred Locations",
			description: "Match candidates based on their preferred work locations",
			weight: 40,
			active: true,
		},
		{
			key: MatchingCriterionKey.SHIFT_TYPE,
			name: "Shift Type (Day/Night)",
			description: "Match candidates based on their preferred shift times",
			weight: 35,
			active: true,
		},
		{
			key: MatchingCriterionKey.CONTRACT_LENGTH,
			name: "Contract Length",
			description:
				"Match candidates based on their availability for contract duration",
			weight: 25,
			active: true,
		},
		{
			key: MatchingCriterionKey.OCCUPATION,
			name: "Occupation",
			description:
				"Match candidates based on their occupation alignment with job requirements",
			weight: 0,
			active: false,
		},
		{
			key: MatchingCriterionKey.SPECIALTIES,
			name: "Specialties",
			description:
				"Match candidates based on their specialty qualifications and expertise",
			weight: 0,
			active: false,
		},
	];
};

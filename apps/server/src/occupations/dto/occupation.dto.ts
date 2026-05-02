import { $Enums, Occupation } from "@repo/db";

export class SpecialtyInOccupationDto {
	id: string;
	name: string;
	acronym: string;
}

export class OccupationSpecialtyLinkDto {
	id: string;
	occupationId: string;
	specialtyId: string;
	specialty: SpecialtyInOccupationDto;
	createdAt: Date;
	updatedAt: Date;
}

export class OccupationDto implements Occupation {
	name: string;
	id: string;
	code: string;
	industry: $Enums.OrganizationIndustry | null;
	acronym: string;
	description: string | null;
	status: $Enums.OccupationStatus;
	hasSpecialty: boolean;
	occupationSpecialties: OccupationSpecialtyLinkDto[];
	createdAt: Date;
	updatedAt: Date;
}

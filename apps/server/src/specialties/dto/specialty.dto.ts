import { $Enums } from "@repo/db";

export class OccupationInSpecialtyDto {
	id: string;
	name: string;
	acronym: string;
}

export class SpecialtyOccupationLinkDto {
	id: string;
	occupationId: string;
	specialtyId: string;
	occupation: OccupationInSpecialtyDto;
	createdAt: Date;
	updatedAt: Date;
}

export class SpecialtyDto {
	id!: string;
	acronym!: string;
	name!: string;
	group!: string | null;
	description!: string | null;
	status!: $Enums.SpecialtyStatus;
	occupationSpecialties!: SpecialtyOccupationLinkDto[];
}

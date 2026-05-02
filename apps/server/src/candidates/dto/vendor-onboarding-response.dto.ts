import { ApiProperty } from "@nestjs/swagger";

export class VendorOnboardingMetricsDto {
	@ApiProperty()
	totalPlacements!: number;

	@ApiProperty()
	cleared!: number;

	@ApiProperty()
	inProgress!: number;

	@ApiProperty()
	behindSchedule!: number;

	@ApiProperty({ description: "Horizon in days (e.g. 21)" })
	windowDays!: number;
}

export class VendorOnboardingDocumentDto {
	@ApiProperty()
	name!: string;

	@ApiProperty({ required: false })
	uploadedDate?: string;

	@ApiProperty({ required: false })
	dueDate?: string;

	@ApiProperty({ enum: ["complete", "pending", "missing", "in-progress"] })
	status!: "complete" | "pending" | "missing" | "in-progress";
}

export class VendorOnboardingCardDto {
	@ApiProperty({ description: "Placement id (card key)" })
	id!: string;

	@ApiProperty()
	candidateId!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	initials!: string;

	@ApiProperty()
	role!: string;

	@ApiProperty()
	startDate!: string;

	@ApiProperty()
	daysRemaining!: number;

	@ApiProperty()
	location!: string;

	@ApiProperty({
		enum: ["Cleared", "In-Progress", "Behind Schedule"],
	})
	status!: "Cleared" | "In-Progress" | "Behind Schedule";

	@ApiProperty()
	progress!: number;

	@ApiProperty()
	documentsCompleted!: number;

	@ApiProperty()
	totalDocuments!: number;

	@ApiProperty()
	dueDate!: string;

	@ApiProperty({ type: [VendorOnboardingDocumentDto] })
	detailedDocuments!: VendorOnboardingDocumentDto[];

	@ApiProperty({ enum: [1, 2, 3] })
	weekBucket!: 1 | 2 | 3;
}

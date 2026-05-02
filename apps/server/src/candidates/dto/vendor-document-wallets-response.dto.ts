import { ApiProperty } from "@nestjs/swagger";

export type VendorDocumentWalletListStatus =
	| "COMPLETE"
	| "IN_PROGRESS"
	| "CRITICAL";

export class VendorDocumentWalletListRowDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty({ nullable: true })
	phone!: string | null;

	@ApiProperty()
	specialty!: string;

	@ApiProperty()
	completedDocs!: number;

	@ApiProperty()
	totalDocs!: number;

	@ApiProperty()
	docCounts!: {
		ok: number;
		pending: number;
		missing: number;
		warning: number;
	};

	@ApiProperty({ enum: ["COMPLETE", "IN_PROGRESS", "CRITICAL"] })
	status!: VendorDocumentWalletListStatus;
}

export class VendorDocumentWalletMetricsDto {
	@ApiProperty()
	totalCandidates!: number;

	@ApiProperty()
	complete!: number;

	@ApiProperty()
	inProgress!: number;

	@ApiProperty()
	critical!: number;
}

import { ApiProperty } from "@nestjs/swagger";

export class DashboardSummaryDto {
	@ApiProperty({
		description: "Total number of organizations",
		example: 100,
	})
	totalOrganizations: number;

	@ApiProperty({
		description: "Total number of locations",
		example: 700,
	})
	totalLocations: number;

	@ApiProperty({
		description: "Total number of vendors",
		example: 300,
	})
	totalVendors: number;

	@ApiProperty({
		description: "Total number of users",
		example: 10000,
	})
	totalUsers: number;

	@ApiProperty({
		description: "Total number of channel partners",
		example: 10,
	})
	totalChannelPartners: number;

	@ApiProperty({
		description: "Total spend",
		example: 25000,
	})
	totalSpend: number;

	@ApiProperty({
		description: "Total available spend",
		example: 100000,
	})
	totalAvailableSpend: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateOrgPortalDelegationDto {
	@ApiProperty({
		format: "uuid",
		description: "Organization the admin wants to view as.",
	})
	@IsUUID()
	organizationId!: string;
}

export class OrgPortalDelegationResponseDto {
	@ApiProperty({
		description:
			"Single-use URL the admin client must open via top-level navigation.",
	})
	url!: string;
}

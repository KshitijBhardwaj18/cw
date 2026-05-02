import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BULK_INVITE_MAX_RECIPIENTS } from "@repo/shared";
import {
	ArrayMaxSize,
	IsArray,
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsUUID,
} from "class-validator";

export class SendInviteDto {
	@ApiProperty({
		description: "Member ID to send invitation to",
		example: "uuid",
	})
	@IsUUID()
	@IsNotEmpty()
	memberId: string;

	@ApiPropertyOptional({
		description: "When to send (ISO 8601). Omit for immediate.",
		example: "2025-03-10T09:00:00.000Z",
	})
	@IsOptional()
	@IsDateString()
	scheduledAt?: string;
}

export class SendBulkInviteDto {
	@ApiProperty({
		description: "Member IDs to invite (max 30 per job)",
		type: [String],
		example: ["uuid1", "uuid2"],
	})
	@IsArray()
	@IsUUID("4", { each: true })
	@ArrayMaxSize(BULK_INVITE_MAX_RECIPIENTS)
	memberIds: string[];

	@ApiPropertyOptional({
		description: "When to send (ISO 8601). Omit for immediate.",
		example: "2025-03-10T09:00:00.000Z",
	})
	@IsOptional()
	@IsDateString()
	scheduledAt?: string;
}

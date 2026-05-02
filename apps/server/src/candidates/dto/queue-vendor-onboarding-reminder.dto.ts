import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class QueueVendorOnboardingReminderDto {
	@ApiProperty({
		description:
			"Placement to send the reminder for (must be in the vendor’s rolling 21-day onboarding window).",
	})
	@IsUUID()
	placementId!: string;
}

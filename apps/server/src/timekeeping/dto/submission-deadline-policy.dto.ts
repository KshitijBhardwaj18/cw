import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateSubmissionDeadlinePolicyDto {
	@ApiPropertyOptional({
		description: "Days after week end to submit timesheet",
		minimum: 1,
		maximum: 30,
	})
	@IsOptional()
	@Transform(({ value }) => (value !== undefined ? Number(value) : value))
	@IsInt()
	@Min(1)
	@Max(30)
	submissionDeadlineDays?: number;

	@ApiPropertyOptional({
		description: "Days between automatic reminders",
		minimum: 1,
		maximum: 14,
	})
	@IsOptional()
	@Transform(({ value }) => (value !== undefined ? Number(value) : value))
	@IsInt()
	@Min(1)
	@Max(14)
	reminderIntervalDays?: number;

	@ApiPropertyOptional({
		description: "Auto-create missing time cases when deadline passes",
	})
	@IsOptional()
	@IsBoolean()
	autoCreateMissingCases?: boolean;
}

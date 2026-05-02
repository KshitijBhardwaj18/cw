import { IsBoolean } from "class-validator";

export class UpdateMetricStatusDto {
	@IsBoolean()
	status: boolean;
}

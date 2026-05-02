import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

const CANDIDATE_SUBMISSION_TABS = [
	"all-applications",
	"submitted",
	"in-review",
	"interview",
	"offer",
	"accepted",
	"rejected",
] as const;

export class QueryCandidateSubmissionsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		description: "Filter to the tab’s stage group (candidate portal)",
		enum: CANDIDATE_SUBMISSION_TABS,
	})
	@IsOptional()
	@IsIn([...CANDIDATE_SUBMISSION_TABS])
	tab?: (typeof CANDIDATE_SUBMISSION_TABS)[number];
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InterviewType, RequisitionType, ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsDateString,
	IsEnum,
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
	ValidateIf,
} from "class-validator";

const SUBMISSION_TYPE_VALUES = [
	"VENDOR_AND_CANDIDATE",
	"VENDOR_ONLY",
	"CANDIDATE_ONLY",
] as const;

const VENDOR_ACCESS_VALUES = ["ALL_VENDORS", "SELECTED_VENDORS"] as const;

const PUBLISH_MODE_VALUES = [
	"SAVE_AS_DRAFT",
	"PUBLISH_IMMEDIATELY",
	"SCHEDULE_PUBLISH_DATE",
] as const;

export class CreateRequisitionDto {
	@ApiProperty({ enum: RequisitionType })
	@IsEnum(RequisitionType)
	type: RequisitionType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	templateId?: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(200)
	jobTitle: string;

	@ApiProperty()
	@IsUUID()
	organizationOccupationId: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	organizationSpecialtyId?: string;

	@ApiProperty()
	@IsUUID()
	locationId: string;

	@ApiProperty()
	@IsUUID()
	departmentId: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(200)
	unitName?: string | null;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(5000)
	jobSummary: string;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@ArrayMaxSize(100)
	benefitsPerks?: string[];

	@ApiProperty({ enum: ShiftType })
	@IsEnum(ShiftType)
	shiftType: ShiftType;

	@ApiProperty()
	@IsDateString()
	startDate: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	endDate?: string | null;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	lengthWeeks: number;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(32)
	startTime: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(32)
	endTime: string;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0.5)
	@Max(24)
	shiftHours: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(7)
	shiftsPerWeek: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@Max(168)
	hoursPerWeek: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	billRate: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	numberOfPositions: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(200)
	incentiveType?: string | null;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	incentiveAmount?: number | null;

	@ApiPropertyOptional({ enum: InterviewType })
	@IsOptional()
	@IsEnum(InterviewType)
	interviewRequired?: InterviewType | null;

	@ApiProperty()
	@IsUUID()
	hiringManagerId: string;

	@ApiProperty()
	@IsUUID()
	complianceChecklistId: string;

	@ApiProperty({ enum: SUBMISSION_TYPE_VALUES })
	@IsIn([...SUBMISSION_TYPE_VALUES])
	submissionType: (typeof SUBMISSION_TYPE_VALUES)[number];

	@ApiProperty({ enum: VENDOR_ACCESS_VALUES })
	@IsIn([...VENDOR_ACCESS_VALUES])
	vendorAccess: (typeof VENDOR_ACCESS_VALUES)[number];

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(2000)
	notesForVendors?: string;

	@ApiProperty({ type: [String] })
	@IsArray()
	@ArrayUnique()
	@IsUUID("4", { each: true })
	@ArrayMaxSize(200)
	acceptanceCriteriaIds: string[];

	@ApiPropertyOptional({ type: [String] })
	@ValidateIf(
		(o: CreateRequisitionDto) => o.vendorAccess === "SELECTED_VENDORS",
	)
	@IsArray()
	@IsUUID("4", { each: true })
	@ArrayMaxSize(500)
	selectedVendorIds?: string[];

	@ApiProperty({ enum: PUBLISH_MODE_VALUES })
	@IsIn([...PUBLISH_MODE_VALUES])
	publishMode: (typeof PUBLISH_MODE_VALUES)[number];

	@ApiPropertyOptional({
		description:
			"Required when publishMode is SCHEDULE_PUBLISH_DATE (ISO 8601)",
	})
	@ValidateIf(
		(o: CreateRequisitionDto) => o.publishMode === "SCHEDULE_PUBLISH_DATE",
	)
	@IsDateString()
	scheduledPublishAt?: string;
}

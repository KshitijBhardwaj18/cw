import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	ComplianceChecklistItemPhase,
	InterviewType,
	MemberRole,
	RequisitionTemplateStatus,
	RequisitionType,
	ShiftType,
	WorkflowType,
} from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from "class-validator";

export class ComplianceChecklistItemPhaseEntryDto {
	@ApiProperty()
	@IsUUID()
	complianceListItemId: string;

	@ApiProperty({ enum: ComplianceChecklistItemPhase })
	@IsEnum(ComplianceChecklistItemPhase)
	phase: ComplianceChecklistItemPhase;
}

export class CreateRequisitionTemplateDto {
	@ApiProperty({ enum: RequisitionType })
	@IsEnum(RequisitionType)
	type: RequisitionType;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(200)
	templateName: string;

	@ApiProperty()
	@IsUUID()
	occupationId: string;

	@ApiPropertyOptional({
		type: [String],
		description:
			"Specialty ids (organizationSpecialty.id). Optional; empty array or omit when no specialties apply.",
	})
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@ArrayMaxSize(50)
	@IsUUID("all", { each: true })
	specialtyIds?: string[];

	@ApiProperty()
	@IsUUID()
	locationId: string;

	@ApiProperty()
	@IsUUID()
	departmentId: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(200)
	unitName?: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(5000)
	jobDescription: string;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(30)
	@IsString({ each: true })
	benefitsPerks?: string[];

	@ApiProperty({ enum: RequisitionTemplateStatus })
	@IsEnum(RequisitionTemplateStatus)
	status: RequisitionTemplateStatus;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	lengthWeeks: number;

	@ApiProperty()
	@IsString()
	startTime: string;

	@ApiProperty()
	@IsString()
	endTime: string;

	@ApiProperty({ enum: ShiftType })
	@IsEnum(ShiftType)
	shiftType: ShiftType;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0.5)
	shiftHours: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	shiftsPerWeek: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	hoursPerWeek?: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	billRate: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	numberOfPositions: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(120)
	incentiveType?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	incentiveAmount?: number;

	@ApiPropertyOptional({ enum: InterviewType })
	@IsOptional()
	@IsEnum(InterviewType)
	interviewRequired?: InterviewType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	hiringManagerId?: string;

	@ApiProperty()
	@IsUUID()
	complianceChecklistId: string;

	@ApiPropertyOptional({
		type: [ComplianceChecklistItemPhaseEntryDto],
		description:
			"When saving a template, syncs submission vs placement for each item on the linked checklist (template/job flow only; checklist CRUD does not send this).",
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ComplianceChecklistItemPhaseEntryDto)
	complianceChecklistItemPhases?: ComplianceChecklistItemPhaseEntryDto[];

	@ApiProperty()
	@IsBoolean()
	requiresApproval: boolean;

	@ApiPropertyOptional({ enum: MemberRole })
	@ValidateIf((o) => o.requiresApproval === true)
	@IsEnum(MemberRole)
	approvalRole?: MemberRole;

	@ApiProperty({ enum: WorkflowType })
	@IsEnum(WorkflowType)
	workflowType: WorkflowType;

	@ApiProperty()
	@IsBoolean()
	selectedVendorsOnly: boolean;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@IsUUID("all", { each: true })
	selectedVendorIds?: string[];

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(2000)
	internalNotes?: string;
}

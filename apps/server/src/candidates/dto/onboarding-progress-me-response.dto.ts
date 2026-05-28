import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	CandidateExperienceBand,
	CandidateInviteStatus,
	CandidatePreferredContractLength,
	CandidateWorkforceType,
	ShiftType,
} from "@repo/db";

export class OnboardingSpecialtyDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;
}

export class OnboardingLocationDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty({ nullable: true, type: String })
	city!: string | null;

	@ApiProperty({ nullable: true, type: String })
	state!: string | null;
}

export class OnboardingProfessionalReferenceResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	fullName!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	organization!: string;

	@ApiProperty()
	relationship!: string;

	@ApiProperty()
	phone!: string;

	@ApiProperty()
	email!: string;
}

export class OnboardingProgressMeResponseDto {
	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty()
	organizationId!: string;

	@ApiProperty()
	organizationName!: string;

	@ApiProperty()
	occupationId!: string;

	@ApiProperty()
	occupationName!: string;

	@ApiPropertyOptional()
	phoneNumber?: string;

	@ApiPropertyOptional()
	streetAddress?: string;

	@ApiPropertyOptional()
	city?: string;

	@ApiPropertyOptional()
	state?: string;

	@ApiPropertyOptional()
	zipCode?: string;

	@ApiProperty({ type: [String] })
	specialtyIds!: string[];

	@ApiProperty({ type: [String] })
	locationIds!: string[];

	@ApiProperty({ type: [OnboardingSpecialtyDto] })
	specialties!: OnboardingSpecialtyDto[];

	@ApiProperty({ type: [OnboardingLocationDto] })
	locations!: OnboardingLocationDto[];

	@ApiProperty({ enum: ShiftType, isArray: true })
	preferredShiftTypes!: ShiftType[];

	@ApiProperty()
	willingToRelocate!: boolean;

	@ApiProperty({ nullable: true, type: String })
	resumeUrl!: string | null;

	@ApiProperty()
	showProfileBanner!: boolean;

	@ApiProperty({ enum: CandidatePreferredContractLength, isArray: true })
	preferredContractLengths!: CandidatePreferredContractLength[];

	@ApiProperty({ enum: CandidateInviteStatus, nullable: true })
	inviteStatus!: CandidateInviteStatus | null;

	@ApiProperty({ nullable: true, type: Date })
	onboardingCompletedAt!: Date | null;

	@ApiProperty({ enum: CandidateExperienceBand, nullable: true })
	totalProfessionalExperienceBand!: CandidateExperienceBand | null;

	@ApiProperty({ nullable: true, type: String })
	earliestStartDate!: string | null;

	@ApiProperty({ nullable: true, type: String })
	recentJobTitle!: string | null;

	@ApiProperty({ nullable: true, type: String })
	dateOfBirth!: string | null;

	@ApiProperty({ nullable: true, type: String })
	lastFourSsn!: string | null;

	@ApiProperty({ nullable: true, type: String })
	skillsChecklistFileKey!: string | null;

	@ApiProperty({ type: [OnboardingProfessionalReferenceResponseDto] })
	professionalReferences!: OnboardingProfessionalReferenceResponseDto[];

	@ApiPropertyOptional({ enum: CandidateWorkforceType, nullable: true })
	workforceType!: CandidateWorkforceType | null;
}

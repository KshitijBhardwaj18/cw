import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsArray,
	IsEmail,
	IsString,
	MaxLength,
	MinLength,
	ValidateNested,
} from "class-validator";

export class OnboardingProfessionalReferenceDto {
	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	fullName!: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	title!: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	organization!: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	relationship!: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(40)
	phone!: string;

	@ApiProperty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsEmail()
	@MaxLength(320)
	email!: string;
}

export class SaveOnboardingReferencesDto {
	@ApiProperty({ type: [OnboardingProfessionalReferenceDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OnboardingProfessionalReferenceDto)
	references!: OnboardingProfessionalReferenceDto[];
}

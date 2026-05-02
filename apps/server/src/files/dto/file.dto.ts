import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from "class-validator";

export class GetSignedPutUrlDto {
	@ApiProperty({
		description: "The S3 key (path) where the file will be uploaded",
		example: "uploads/documents/invoice-2024.pdf",
	})
	@IsString()
	@IsNotEmpty()
	key: string;

	@ApiProperty({
		description: "The MIME type of the file to be uploaded",
		example: "application/pdf",
	})
	@IsString()
	@IsNotEmpty()
	contentType: string;
}

export class GetSignedPutUrlsDto {
	@ApiProperty({
		description: "Array of files to generate signed URLs for",
		type: [GetSignedPutUrlDto],
		example: [
			{
				key: "uploads/documents/invoice-2024.pdf",
				contentType: "application/pdf",
			},
			{
				key: "uploads/images/photo.jpg",
				contentType: "image/jpeg",
			},
		],
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => GetSignedPutUrlDto)
	files: GetSignedPutUrlDto[];
}

export class GetSignedPutUrlsResponseDto {
	signedUrl: string;
	fileUrl: string;
}

export class GetSignedPutUrlsResponseItemDto extends GetSignedPutUrlsResponseDto {
	key: string;
}

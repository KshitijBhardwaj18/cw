import {
	type ArgumentMetadata,
	BadRequestException,
	type PipeTransform,
} from "@nestjs/common";
import { validateBulkEnrollmentCsv } from "@repo/shared";

export class BulkEnrollmentFilePipe
	implements PipeTransform<Express.Multer.File | undefined>
{
	transform(
		value: Express.Multer.File | undefined,
		_metadata: ArgumentMetadata,
	): Express.Multer.File {
		if (!value?.buffer) {
			throw new BadRequestException("File is required.");
		}
		const error = validateBulkEnrollmentCsv(
			{
				size: value.size,
				mimetype: value.mimetype,
				originalname: value.originalname,
			},
			"File",
		);
		if (error) {
			throw new BadRequestException(error);
		}
		return value;
	}
}

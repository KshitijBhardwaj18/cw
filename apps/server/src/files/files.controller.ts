import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetSignedPutUrlDto, GetSignedPutUrlsDto } from "./dto/file.dto";
import { FilesService } from "./files.service";

@ApiTags("files")
@Controller("files")
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post("signed-put-url")
	@ApiOperation({
		summary: "Get a signed PUT URL for direct S3 upload",
		description:
			"Generates a pre-signed URL that allows the client to upload a file directly to S3. The URL expires after 15 minutes by default.",
	})
	async getSignedPutUrl(@Body() dto: GetSignedPutUrlDto) {
		return this.filesService.getSignedPutUrl(dto.key, dto.contentType);
	}

	@Post("signed-put-urls")
	@ApiOperation({
		summary: "Get multiple signed PUT URLs for batch uploads",
		description:
			"Generates multiple pre-signed URLs for batch file uploads directly to S3. Each URL expires after 15 minutes by default.",
	})
	async getSignedPutUrls(@Body() dto: GetSignedPutUrlsDto) {
		return this.filesService.getSignedPutUrls(dto.files);
	}
}

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { createS3Client } from "@repo/shared";
import { config } from "src/common/config";
import {
	GetSignedPutUrlsResponseDto,
	GetSignedPutUrlsResponseItemDto,
} from "./dto/file.dto";

@Injectable()
export class FilesService {
	private readonly s3Client: S3Client;
	private readonly bucket: string;
	private readonly logger = new Logger(FilesService.name);

	constructor() {
		this.s3Client = createS3Client(config.aws.s3);
		this.bucket = config.aws.s3.bucket;
	}

	/**
	 * Uploads a file to S3.
	 * @param options.public - When true, returns URL for direct access; otherwise returns key for use with getSignedUrl (default: private)
	 */
	async uploadFile(
		file: Express.Multer.File,
		key: string,
	): Promise<{ key: string }>;
	async uploadFile(
		file: Express.Multer.File,
		key: string,
		options: { public: true },
	): Promise<{ url: string }>;
	async uploadFile(
		file: Express.Multer.File,
		key: string,
		options?: { public?: boolean },
	): Promise<{ key: string } | { url: string }> {
		return this.doUpload(file.buffer, key, file.mimetype, options?.public);
	}

	/**
	 * Uploads a buffer to S3.
	 * @param options.public - When true, returns URL for direct access; otherwise returns key for use with getSignedUrl (default: private)
	 */
	async uploadFileBuffer(
		buffer: Buffer,
		key: string,
		mimetype?: string,
	): Promise<{ key: string }>;
	async uploadFileBuffer(
		buffer: Buffer,
		key: string,
		mimetype: string | undefined,
		options: { public: true },
	): Promise<{ url: string }>;
	async uploadFileBuffer(
		buffer: Buffer,
		key: string,
		mimetype?: string,
		options?: { public?: boolean },
	): Promise<{ key: string } | { url: string }> {
		return this.doUpload(
			buffer,
			key,
			mimetype || "application/octet-stream",
			options?.public,
		);
	}

	private async doUpload(
		body: Buffer,
		key: string,
		contentType: string,
		isPublic?: boolean,
	): Promise<{ key: string } | { url: string }> {
		this.logger.debug(`Uploading file to ${key}`);
		try {
			const uploadCommand = new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: body,
				ContentType: contentType,
			});
			await this.s3Client.send(uploadCommand);
			this.logger.debug(`Uploaded to S3: ${key}`);
			return isPublic ? { url: this.getFileUrl(key) } : { key };
		} catch (error) {
			this.logger.error(`Error uploading to S3: ${error}`);
			throw new InternalServerErrorException(
				"File upload failed. Please try again.",
			);
		}
	}

	getFileUrl(key: string): string {
		return `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com/${key}`;
	}

	/**
	 * Generates a pre-signed URL for secure temporary access to an S3 object.
	 *
	 * @param url - The full S3 URL or key
	 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
	 * @returns The pre-signed URL
	 */
	async getSignedUrl(url: string, expiresIn: number = 3600): Promise<string> {
		try {
			const key = url.includes("http")
				? this.extractKeyFromDecodedUrl(url)
				: url;

			if (!key) {
				throw new InternalServerErrorException(
					"Invalid stored file reference.",
				);
			}

			this.logger.debug(`Generating signed URL for: ${key}`);

			const command = new GetObjectCommand({
				Bucket: this.bucket,
				Key: key,
			});

			// biome-ignore lint/suspicious/noExplicitAny: only way to get signed url
			const signedUrl = await getSignedUrl(this.s3Client as any, command, {
				expiresIn,
			});

			this.logger.debug(`Generated signed URL (expires in ${expiresIn}s)`);
			return signedUrl;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			this.logger.error(`Error generating signed URL: ${error}`);
			throw new InternalServerErrorException(
				"Could not prepare file download. Please try again.",
			);
		}
	}

	/**
	 * Generates a pre-signed PUT URL for uploading files directly to S3.
	 *
	 * @param key - The S3 key (path) where the file will be uploaded
	 * @param contentType - The MIME type of the file to be uploaded
	 * @param expiresIn - Expiration time in seconds (default: 900 = 15 minutes)
	 * @returns Object containing the signed PUT URL and the final file URL
	 * ```tsx
	 * await fetch(signedUrl, {
	 *   	method: 'PUT',
	 *   	body: file,
	 *   	headers: {
	 *       'Content-Type': file.type // Must match the contentType from step 1
	 *    }
	 * });
	 * ```
	 */
	async getSignedPutUrl(
		key: string,
		contentType: string,
		expiresIn: number = 900,
	): Promise<GetSignedPutUrlsResponseDto> {
		try {
			this.logger.debug(`Generating signed PUT URL for: ${key}`);

			const command = new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				ContentType: contentType,
			});

			// biome-ignore lint/suspicious/noExplicitAny: only way to get signed url
			const signedUrl = await getSignedUrl(this.s3Client as any, command, {
				expiresIn,
			});

			const fileUrl = this.getFileUrl(key);

			this.logger.debug(`Generated signed PUT URL (expires in ${expiresIn}s)`);
			return { signedUrl, fileUrl };
		} catch (error) {
			if (error instanceof HttpException) throw error;
			this.logger.error(`Error generating signed PUT URL: ${error}`);
			throw new InternalServerErrorException(
				"Could not prepare file upload. Please try again.",
			);
		}
	}

	/**
	 * Generates multiple pre-signed PUT URLs for batch file uploads.
	 *
	 * @param files - Array of objects containing key and contentType
	 * @param expiresIn - Expiration time in seconds (default: 900 = 15 minutes)
	 * @returns Array of objects containing key, signed PUT URL, and final file URL
	 */
	async getSignedPutUrls(
		files: Array<{ key: string; contentType: string }>,
		expiresIn: number = 900,
	): Promise<Array<GetSignedPutUrlsResponseItemDto>> {
		try {
			this.logger.debug(`Generating ${files.length} signed PUT URLs`);

			const results = await Promise.all(
				files.map(async ({ key, contentType }) => {
					const { signedUrl, fileUrl } = await this.getSignedPutUrl(
						key,
						contentType,
						expiresIn,
					);
					return { key, signedUrl, fileUrl };
				}),
			);

			this.logger.debug(
				`Generated ${results.length} signed PUT URLs successfully`,
			);
			return results;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			this.logger.error(`Error generating signed PUT URLs: ${error}`);
			throw new InternalServerErrorException(
				"Could not prepare file uploads. Please try again.",
			);
		}
	}

	/**
	 * Deletes a file from S3 by key.
	 */
	async deleteFile(key: string): Promise<void> {
		try {
			await this.s3Client.send(
				new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
			);
			this.logger.debug(`Deleted from S3: ${key}`);
		} catch (error) {
			this.logger.error(`Error deleting from S3: ${error}`);
			throw new InternalServerErrorException(
				"Could not delete file. Please try again.",
			);
		}
	}

	/**
	 * Extracts the S3 key from a full S3 URL.
	 *
	 * @param url - The full S3 URL
	 * @returns The S3 key (path to the file) or null if URL is invalid
	 */
	extractKeyFromDecodedUrl(url: string): string | null {
		try {
			const urlObj = new URL(url);
			const key = decodeURIComponent(urlObj.pathname.substring(1));
			return key || null;
		} catch (error) {
			this.logger.error(`Error extracting key from URL: ${error}`);
			return null;
		}
	}
}

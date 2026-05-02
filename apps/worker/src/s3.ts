import {
	DeleteObjectCommand,
	GetObjectCommand,
	type S3Client,
} from "@aws-sdk/client-s3";
import { createS3Client as createSharedS3Client } from "@repo/shared";
import { config } from "./config.js";

export function createS3Client(): S3Client {
	return createSharedS3Client(config.aws.s3);
}

export function getS3Bucket(): string {
	return config.aws.s3.bucket;
}

export async function getFileBuffer(
	client: S3Client,
	bucket: string,
	key: string,
): Promise<Buffer> {
	const response = await client.send(
		new GetObjectCommand({ Bucket: bucket, Key: key }),
	);
	const chunks: Uint8Array[] = [];
	if (response.Body) {
		for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
			chunks.push(chunk);
		}
	}
	return Buffer.concat(chunks);
}

export async function deleteFile(
	client: S3Client,
	bucket: string,
	key: string,
): Promise<void> {
	await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

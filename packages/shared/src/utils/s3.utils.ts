import { S3Client } from "@aws-sdk/client-s3";

export type S3ClientConfig = {
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
};

export function createS3Client(config: S3ClientConfig): S3Client {
	const options: {
		region: string;
		credentials?: { accessKeyId: string; secretAccessKey: string };
	} = {
		region: config.region,
	};
	if (config.accessKeyId && config.secretAccessKey) {
		options.credentials = {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		};
	}
	return new S3Client(options);
}

import "dotenv/config";

export const config = {
	environment: process.env.NODE_ENV || "development",
	urls: {
		db:
			process.env.DATABASE_URL ||
			"postgresql://postgres:postgres@localhost:5432/postgres",
	},
	redis: {
		url: process.env.REDIS_URL || "redis://localhost:6379",
	},
	aws: {
		s3: {
			region: process.env.AWS_S3_REGION || "us-east-1",
			accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
			bucket: process.env.AWS_S3_BUCKET || "",
		},
	},
	mail: {
		smtp: {
			host: process.env.SMTP_HOST || "smtp.gmail.com",
			port: Number.parseInt(process.env.SMTP_PORT || "465", 10),
			auth: {
				user: process.env.SMTP_USER || "",
				pass: process.env.SMTP_PASSWORD || "",
			},
		},
		defaults: {
			from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
			fromName: process.env.SMTP_FROM_NAME || "Staff Logic",
		},
		staffLogicLogoUrl:
			process.env.STAFF_LOGIC_LOGO_URL ||
			`${process.env.ADMIN_FRONTEND_URL || "http://localhost:3000"}/images/logo.png`,
	},
	orgPortalBaseUrl: process.env.ORG_PORTAL_BASE_URL || "http://localhost:3002",
} as const;

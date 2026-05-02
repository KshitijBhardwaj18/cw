import "dotenv/config";

export const config = {
	environment: process.env.NODE_ENV || "development",
	host: process.env.HOST || "0.0.0.0",
	port: 3001,
	betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
	betterAuthUrl: process.env.BETTER_AUTH_URL || "",
	betterAuthDomain: process.env.BETTER_AUTH_DOMAIN || "",
	urls: {
		adminFrontend: process.env.ADMIN_FRONTEND_URL || "http://localhost:3000",
		orgPortalBaseUrl:
			process.env.ORG_PORTAL_BASE_URL || "http://localhost:3002",
		api: process.env.API_URL || "http://localhost:3001",
		cors: process.env.CORS_URLS?.split(",") || ["http://localhost:3000"],
		db:
			process.env.DATABASE_URL ||
			"postgresql://postgres:postgres@localhost:5432/postgres",
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
				user: process.env.SMTP_USER || "your-email@gmail.com",
				pass: process.env.SMTP_PASSWORD || "your-password",
			},
		},
		defaults: {
			from: process.env.SMTP_FROM || "your-email@gmail.com",
			fromName: process.env.SMTP_FROM_NAME || "StaffLogic",
		},
	},
	redis: {
		url: process.env.REDIS_URL || "redis://localhost:6379",
	},
	slugs: {
		reserved:
			process.env.RESERVED_SLUGS?.split(",")
				.map((s) => s.trim())
				.filter(Boolean) ?? [],
	},
};

import { HeizenLoggerModule } from "@heizen-labs/logger";
import { config } from "./config";

const isDevelopment = config.environment === "development";
export const heizenLoggerConfig = isDevelopment
	? HeizenLoggerModule.forRoot(
			(() => {
				const projectId = process.env.HEIZEN_PROJECT_ID || "workforce";
				const projectName = process.env.HEIZEN_PROJECT_NAME || "Workforce API";
				const environment = process.env.NODE_ENV || "development";
				const token = process.env.HEIZEN_API_KEY;
				const endpoint = process.env.HEIZEN_ENDPOINT;
				if (!token) {
					throw new Error("HEIZEN_API_KEY is required");
				}

				if (!endpoint) {
					throw new Error("HEIZEN_ENDPOINT is required");
				}

				return {
					transport: {
						project: { id: projectId, name: projectName, environment },
						auth: { type: "basic-token", token: token },
						endpoint,
					},
					batchingConfig: {
						flushIntervalMs: 5000,
						batchSize: 100,
						maxQueueSize: 10000,
					},
				};
			})(),
			{
				enableInterceptor: true,
				skipPaths: ["/health", "/metrics"],
			},
		)
	: null;

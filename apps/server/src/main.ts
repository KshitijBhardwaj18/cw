import { HeizenLoggerService } from "@heizen-labs/logger";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { config } from "./common/config";
import { GlobalExceptionFilter } from "./common/filter/global-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false, // Required for Better Auth
	});

	const corsWithRegex = config.urls.cors.map((value) => {
		if (!value.includes("*")) {
			return value;
		}

		const escaped = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		const regexString = `^${escaped.replace(/\*/g, ".*")}$`;
		return new RegExp(regexString);
	});

	app.enableCors({
		origin: corsWithRegex,
		credentials: true,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors) => {
				return new BadRequestException({
					message: "Something went wrong",
					data: errors,
				});
			},
			whitelist: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: false,
			},
		}),
	);
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.use((req, res, next) => {
		const path = (req.originalUrl ?? "").split("?")[0];
		if (path.startsWith("/api/auth/")) {
			return next();
		}
		json({ limit: "10mb" })(req, res, (err) => {
			if (err) return next(err);
			urlencoded({ extended: true, limit: "10mb" })(req, res, next);
		});
	});
	app.setGlobalPrefix("/api");
	const isDevelopment = config.environment === "development";
	if (isDevelopment) {
		app.useLogger(app.get(HeizenLoggerService));
	}

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Staff Logic API")
		.setDescription("Staff Logic Workforce API Documentation")
		.setVersion("1.0")
		.addCookieAuth("admin.session_token")
		.addCookieAuth("org.session_token")
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	if (config.environment !== "production") {
		SwaggerModule.setup("docs", app, document);
	}

	await app.listen(config.port, config.host, () => {
		console.log(`Server is running on port ${config.port}`);
	});
}
bootstrap();

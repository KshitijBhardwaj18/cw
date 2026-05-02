import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { MetricsController } from "./controllers/metrics.controller";
import { MetricsService } from "./services/metrics.service";

@Module({
	imports: [BackgroundJobsModule],
	controllers: [MetricsController],
	providers: [MetricsService],
	exports: [MetricsService],
})
export class MetricsModule {}

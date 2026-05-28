import { Module } from "@nestjs/common";
import { AgingRulesModule } from "src/aging-rules/aging-rules.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { VendorDashboardController } from "./vendor-dashboard.controller";
import { VendorDashboardService } from "./vendor-dashboard.service";

@Module({
	imports: [AgingRulesModule],
	providers: [DashboardService, VendorDashboardService],
	controllers: [DashboardController, VendorDashboardController],
})
export class DashboardModule {}

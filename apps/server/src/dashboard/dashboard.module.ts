import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { VendorDashboardController } from "./vendor-dashboard.controller";
import { VendorDashboardService } from "./vendor-dashboard.service";

@Module({
	providers: [DashboardService, VendorDashboardService],
	controllers: [DashboardController, VendorDashboardController],
})
export class DashboardModule {}

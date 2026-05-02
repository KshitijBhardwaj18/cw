import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { BillingController } from "./controllers/billing.controller";
import { BillingInvoicesController } from "./controllers/billing-invoices.controller";
import { BillingSpendAnalyticsController } from "./controllers/billing-spend-analytics.controller";
import { OrganizationBillingController } from "./controllers/organization-billing.controller";
import { OrganizationBillingInvoicesController } from "./controllers/organization-billing-invoices.controller";
import { OrganizationBillingSpendAnalyticsController } from "./controllers/organization-billing-spend-analytics.controller";
import { BillingService } from "./services/billing.service";
import { BillingInvoicesService } from "./services/billing-invoices.service";
import { BillingSpendAnalyticsService } from "./services/billing-spend-analytics.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [
		BillingController,
		BillingInvoicesController,
		BillingSpendAnalyticsController,
		OrganizationBillingController,
		OrganizationBillingInvoicesController,
		OrganizationBillingSpendAnalyticsController,
	],
	providers: [
		BillingService,
		BillingInvoicesService,
		BillingSpendAnalyticsService,
	],
})
export class BillingModule {}

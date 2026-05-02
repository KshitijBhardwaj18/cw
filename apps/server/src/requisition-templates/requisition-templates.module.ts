import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RequisitionTemplatesController } from "./requisition-templates.controller";
import { RequisitionTemplatesService } from "./requisition-templates.service";

@Module({
	imports: [PrismaModule],
	controllers: [RequisitionTemplatesController],
	providers: [RequisitionTemplatesService],
	exports: [RequisitionTemplatesService],
})
export class RequisitionTemplatesModule {}

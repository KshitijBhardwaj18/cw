import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { WorkforceListsController } from "./workforce-lists.controller";
import { WorkforceListsService } from "./workforce-lists.service";

@Module({
	imports: [PrismaModule],
	controllers: [WorkforceListsController],
	providers: [WorkforceListsService],
})
export class WorkforceListsModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ShiftRoutingController } from "./shift-routing.controller";
import { ShiftRoutingService } from "./shift-routing.service";

@Module({
	imports: [PrismaModule],
	controllers: [ShiftRoutingController],
	providers: [ShiftRoutingService],
	exports: [ShiftRoutingService],
})
export class ShiftRoutingModule {}

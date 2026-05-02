import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ShiftTemplatesController } from "./shift-templates.controller";
import { ShiftTemplatesService } from "./shift-templates.service";

@Module({
	imports: [PrismaModule],
	controllers: [ShiftTemplatesController],
	providers: [ShiftTemplatesService],
	exports: [ShiftTemplatesService],
})
export class ShiftTemplatesModule {}

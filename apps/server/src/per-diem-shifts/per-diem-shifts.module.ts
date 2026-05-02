import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { PerDiemShiftAssignmentController } from "./controllers/per-diem-shift-assignment.controller";
import { PerDiemShiftTimecardsController } from "./controllers/per-diem-shift-timecards.controller";
import { PerDiemShiftsController } from "./controllers/per-diem-shifts.controller";
import { PerDiemShiftAssignmentService } from "./services/per-diem-shift-assignment.service";
import { PerDiemShiftTimecardsService } from "./services/per-diem-shift-timecards.service";
import { PerDiemShiftsService } from "./services/per-diem-shifts.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [
		PerDiemShiftsController,
		PerDiemShiftAssignmentController,
		PerDiemShiftTimecardsController,
	],
	providers: [
		PerDiemShiftsService,
		PerDiemShiftAssignmentService,
		PerDiemShiftTimecardsService,
	],
	exports: [
		PerDiemShiftsService,
		PerDiemShiftAssignmentService,
		PerDiemShiftTimecardsService,
	],
})
export class PerDiemShiftsModule {}

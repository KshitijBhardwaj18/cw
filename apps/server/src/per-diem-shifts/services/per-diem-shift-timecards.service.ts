import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { TimeEntryDataSource, TimesheetEntryStatus, UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { PrismaService } from "src/prisma/prisma.service";
import type { SubmitShiftTimecardDto } from "../dto/per-diem-shift-timecards/submit-shift-timecard.dto";
import {
	computeShiftHours,
	MAX_PER_DIEM_SHIFT_TOTAL_HOURS,
} from "../shift-timecard-hours";

@Injectable()
export class PerDiemShiftTimecardsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private async assertMobileEntryEnabled(orgId: string) {
		const cfg = await this.prisma.billingConfig.findFirst({
			where: { organizationId: orgId, isActive: true },
			select: { mobileEntry: true },
		});
		if (!(cfg?.mobileEntry ?? false)) {
			throw new ForbiddenException(
				"Mobile time entry is disabled for this organization",
			);
		}
	}

	private parseWorkDateAtUtcNoon(iso: string): Date {
		const [y, m, d] = iso.split("-").map(Number);
		if (!y || !m || !d) throw new BadRequestException("Invalid workDate");
		return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
	}

	private async assertVendorCanAccessCandidate(
		_actorUserId: string,
		candidateVendorId: string | null,
		session?: UserSession,
	) {
		const actor = resolveVendorActor(session);
		if (candidateVendorId !== actor.vendorId) {
			throw new ForbiddenException(
				"You can only edit timecards for your agency's candidates",
			);
		}
	}

	async submitShiftTimecard(
		userId: string,
		orgId: string,
		shiftId: string,
		dto: SubmitShiftTimecardDto,
	) {
		await this.assertMobileEntryEnabled(orgId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found");

		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: {
				id: true,
				shiftDate: true,
				totalShiftHours: true,
				organizationId: true,
				departmentId: true,
				locationId: true,
			},
		});
		if (!shift) throw new NotFoundException("Shift not found");

		const assignment = await this.prisma.perDiemAssignment.findFirst({
			where: { shiftId, candidateId: candidate.id },
			select: { id: true, status: true },
		});
		if (!assignment)
			throw new NotFoundException("No assignment found for this shift");

		return this.persistTimecardForAssignment(
			orgId,
			candidate.id,
			assignment,
			shift,
			dto,
		);
	}

	async submitAssignmentTimecardForOrgActor(
		actorUserId: string,
		actorRole: UserRole,
		orgId: string,
		assignmentId: string,
		dto: SubmitShiftTimecardDto,
		session?: UserSession,
	) {
		await this.assertMobileEntryEnabled(orgId);
		const assignmentRow = await this.prisma.perDiemAssignment.findFirst({
			where: { id: assignmentId, shift: { organizationId: orgId } },
			select: {
				id: true,
				status: true,
				candidateId: true,
				candidate: { select: { vendorId: true } },
				shift: {
					select: {
						id: true,
						shiftDate: true,
						totalShiftHours: true,
						organizationId: true,
						departmentId: true,
						locationId: true,
					},
				},
			},
		});
		if (!assignmentRow) throw new NotFoundException("Assignment not found");

		if (actorRole === UserRole.VENDOR_USER) {
			await this.assertVendorCanAccessCandidate(
				actorUserId,
				assignmentRow.candidate.vendorId,
				session,
			);
		}

		return this.persistTimecardForAssignment(
			orgId,
			assignmentRow.candidateId,
			{ id: assignmentRow.id, status: assignmentRow.status },
			assignmentRow.shift,
			dto,
		);
	}

	private async persistTimecardForAssignment(
		orgId: string,
		candidateId: string,
		assignment: { id: string; status: string },
		shift: {
			id: string;
			shiftDate: Date;
			totalShiftHours: number;
			organizationId: string;
			departmentId: string | null;
			locationId: string;
		},
		dto: SubmitShiftTimecardDto,
	) {
		if (assignment.status === "cancelled") {
			throw new BadRequestException("This assignment is cancelled");
		}

		const shiftDateIso = shift.shiftDate.toISOString().slice(0, 10);
		if (!dto.entries?.length) {
			throw new BadRequestException("At least one time entry is required");
		}

		const normalized = dto.entries.map((e) => ({
			workDate: e.workDate.trim(),
			isOvertime: e.isOvertime,
			start: e.start.trim(),
			end: e.end.trim(),
			breakMin: Number.isFinite(e.breakMin) ? e.breakMin : 0,
		}));

		for (const row of normalized) {
			if (row.workDate !== shiftDateIso) {
				throw new BadRequestException(
					`workDate must be the shift date (${shiftDateIso})`,
				);
			}
		}

		const regularRows = normalized.filter((e) => !e.isOvertime);
		if (regularRows.length !== 1) {
			throw new BadRequestException(
				"Include exactly one regular row (isOvertime: false)",
			);
		}

		const regular = regularRows[0] as (typeof normalized)[0];
		const filled = normalized.filter(
			(e) => e.start.length > 0 && e.end.length > 0,
		);
		let totalHours = 0;
		for (const row of filled) {
			totalHours += computeShiftHours(row.start, row.end, row.breakMin);
		}
		totalHours = Math.round(totalHours * 100) / 100;

		if (dto.submit) {
			if (!regular.start || !regular.end) {
				throw new BadRequestException(
					"Enter start and end times on the regular row before submitting",
				);
			}
			if (totalHours <= 0) {
				throw new BadRequestException(
					"Enter at least one time segment with hours before submitting",
				);
			}
			if (totalHours > MAX_PER_DIEM_SHIFT_TOTAL_HOURS) {
				throw new BadRequestException(
					`Total hours cannot exceed ${MAX_PER_DIEM_SHIFT_TOTAL_HOURS} hours for a single-day shift`,
				);
			}
		}

		const notesTrimmed = dto.notes?.trim() ?? "";

		const rowsBuilt: Array<{
			workDate: Date;
			clockIn: string | null;
			clockOut: string | null;
			breakMinutes: number;
			regularHours: number;
			overtimeHours: number;
			hours: number;
			notes: string | null;
		}> = [];

		for (const row of filled) {
			const hrs = computeShiftHours(row.start, row.end, row.breakMin);
			if (hrs <= 0) continue;
			rowsBuilt.push({
				workDate: this.parseWorkDateAtUtcNoon(row.workDate),
				clockIn: row.start,
				clockOut: row.end,
				breakMinutes: row.breakMin,
				regularHours: row.isOvertime ? 0 : hrs,
				overtimeHours: row.isOvertime ? hrs : 0,
				hours: hrs,
				notes: null,
			});
		}

		const entryStatus = dto.submit
			? TimesheetEntryStatus.PENDING
			: TimesheetEntryStatus.DRAFT;

		await this.prisma.$transaction(async (tx) => {
			let timesheetId: string | undefined = (
				await tx.timesheet.findFirst({
					where: { perDiemAssignmentId: assignment.id },
					select: { id: true },
				})
			)?.id;

			if (rowsBuilt.length > 0) {
				if (!timesheetId) {
					const created = await tx.timesheet.create({
						data: {
							organizationId: orgId,
							candidateId,
							perDiemAssignmentId: assignment.id,
							departmentId: shift.departmentId,
							locationId: shift.locationId,
							weekEndingDate: shift.shiftDate,
						},
					});
					timesheetId = created.id;
				} else {
					await tx.timesheetEntry.deleteMany({ where: { timesheetId } });
				}
				await tx.timesheetEntry.createMany({
					data: rowsBuilt.map((r) => ({
						timesheetId: timesheetId as string,
						organizationId: orgId,
						candidateId,
						placementId: null,
						perDiemAssignmentId: assignment.id,
						departmentId: shift.departmentId,
						locationId: shift.locationId,
						workDate: r.workDate,
						clockIn: r.clockIn,
						clockOut: r.clockOut,
						breakMinutes: r.breakMinutes,
						regularHours: r.regularHours,
						overtimeHours: r.overtimeHours,
						hours: r.hours,
						notes: r.notes,
						status: entryStatus,
						dataSource: TimeEntryDataSource.MANUAL,
					})),
				});
			} else if (timesheetId) {
				await tx.timesheetEntry.deleteMany({ where: { timesheetId } });
			}

			await tx.perDiemAssignment.update({
				where: { id: assignment.id },
				data: {
					candidateFeedback: notesTrimmed.length > 0 ? notesTrimmed : null,
					status: dto.submit ? "submitted" : "draft",
				},
				select: { id: true },
			});
		});

		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			shift.shiftDate.toISOString(),
		);

		return {
			success: true,
			actualHours: totalHours,
			status: dto.submit ? "submitted" : "draft",
		};
	}
}

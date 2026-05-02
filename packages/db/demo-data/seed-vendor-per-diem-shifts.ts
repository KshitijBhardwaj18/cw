/**
 * Seeds sample PerDiemShift rows per organization (OPEN + optional assignments).
 * Idempotent per org via stable `shiftNumber` prefixes derived from org slug/id.
 * For each org: requires at least one Department + ACTIVE organizationVendor (for vendorId on assignments).
 */
import type { PrismaClient } from "@repo/db";
import {
	OrganizationVendorStatus,
	PerDiemShiftStatus,
	ShiftType,
} from "@repo/db";

const TEMPLATE_BASE_NAME = "Seed — Vendor Per Diem Demo";

function addUtcDays(base: Date, days: number): Date {
	const d = new Date(base.getTime());
	d.setUTCDate(d.getUTCDate() + days);
	return new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0),
	);
}

function shiftPrefixForOrg(orgId: string, slug: string | null): string {
	const fromSlug = (slug ?? "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 24);
	const key =
		fromSlug.length > 0 ? fromSlug : orgId.replace(/-/g, "").slice(0, 8);
	return `SEED-VPD-${key}`;
}

async function seedShiftsForOrg(
	prisma: PrismaClient,
	orgId: string,
	vendorId: string | null,
	shiftPrefix: string,
	templateName: string,
): Promise<{
	createdOpen: number;
	createdAssigned: boolean;
	skipped: string | null;
}> {
	const existingCount = await prisma.perDiemShift.count({
		where: {
			organizationId: orgId,
			shiftNumber: { startsWith: shiftPrefix },
		},
	});
	if (existingCount > 0) {
		return {
			createdOpen: 0,
			createdAssigned: false,
			skipped: `already have ${existingCount} shift(s) (${shiftPrefix}*)`,
		};
	}

	const dept = await prisma.department.findFirst({
		where: { organizationId: orgId },
		include: {
			organizationOccupation: { select: { occupationId: true } },
		},
	});

	if (!dept) {
		return {
			createdOpen: 0,
			createdAssigned: false,
			skipped: "no department",
		};
	}

	const occupationId = dept.organizationOccupation.occupationId;

	let specialtyId: string | null = null;
	if (dept.organizationSpecialtyId) {
		const os = await prisma.organizationSpecialty.findUnique({
			where: { id: dept.organizationSpecialtyId },
			select: { specialtyId: true },
		});
		specialtyId = os?.specialtyId ?? null;
	}

	let template = await prisma.shiftTemplate.findFirst({
		where: { organizationId: orgId, templateName },
		select: { id: true },
	});

	if (!template) {
		template = await prisma.shiftTemplate.create({
			data: {
				organizationId: orgId,
				templateName,
				occupationId,
				departmentId: dept.id,
				locationId: dept.locationId,
				shiftType: ShiftType.DAYS,
				durationHours: 12,
				baseRate: 55,
				baseBillRate: 85,
				isActive: true,
			},
			select: { id: true },
		});
	}

	const shiftRate = 85;
	const vendorRate = 68;
	const totalShiftHours = 12;
	const totalCost = shiftRate * totalShiftHours;

	const baseDay = addUtcDays(new Date(), 1);

	const openRows: Array<{
		shiftNumber: string;
		shiftDate: Date;
		isUrgent: boolean;
		startTime: string;
		endTime: string;
		shiftType: ShiftType;
	}> = [
		{
			shiftNumber: `${shiftPrefix}-OPEN-1`,
			shiftDate: baseDay,
			isUrgent: true,
			startTime: "07:00",
			endTime: "19:00",
			shiftType: ShiftType.DAYS,
		},
		{
			shiftNumber: `${shiftPrefix}-OPEN-2`,
			shiftDate: addUtcDays(baseDay, 1),
			isUrgent: false,
			startTime: "07:00",
			endTime: "19:00",
			shiftType: ShiftType.DAYS,
		},
		{
			shiftNumber: `${shiftPrefix}-OPEN-3`,
			shiftDate: addUtcDays(baseDay, 2),
			isUrgent: false,
			startTime: "19:00",
			endTime: "07:00",
			shiftType: ShiftType.NIGHTS,
		},
	];

	for (const row of openRows) {
		await prisma.perDiemShift.create({
			data: {
				organizationId: orgId,
				shiftTemplateId: template.id,
				shiftNumber: row.shiftNumber,
				shiftDate: row.shiftDate,
				startTime: row.startTime,
				endTime: row.endTime,
				totalShiftHours,
				shiftType: row.shiftType,
				occupationId,
				specialtyId,
				departmentId: dept.id,
				locationId: dept.locationId,
				shiftRate,
				vendorRate,
				totalCost,
				status: PerDiemShiftStatus.OPEN,
				isPublic: true,
				isUrgent: row.isUrgent,
			},
		});
	}

	let createdAssigned = false;
	if (vendorId) {
		const candidate = await prisma.candidate.findFirst({
			where: {
				organizationId: orgId,
				vendorId,
				occupationId,
				isActive: true,
			},
			select: { id: true },
		});

		if (candidate) {
			const inProgShift = await prisma.perDiemShift.create({
				data: {
					organizationId: orgId,
					shiftTemplateId: template.id,
					shiftNumber: `${shiftPrefix}-ASSIGNED-IP`,
					shiftDate: addUtcDays(baseDay, -1),
					startTime: "07:00",
					endTime: "15:00",
					totalShiftHours: 8,
					shiftType: ShiftType.DAYS,
					occupationId,
					specialtyId,
					departmentId: dept.id,
					locationId: dept.locationId,
					shiftRate: 72,
					vendorRate: 58,
					totalCost: 72 * 8,
					status: PerDiemShiftStatus.IN_PROGRESS,
					isPublic: true,
					isUrgent: false,
				},
				select: { id: true },
			});

			await prisma.perDiemAssignment.create({
				data: {
					shiftId: inProgShift.id,
					candidateId: candidate.id,
					vendorId,
				},
			});

			const doneShift = await prisma.perDiemShift.create({
				data: {
					organizationId: orgId,
					shiftTemplateId: template.id,
					shiftNumber: `${shiftPrefix}-ASSIGNED-DONE`,
					shiftDate: addUtcDays(baseDay, -14),
					startTime: "07:00",
					endTime: "15:00",
					totalShiftHours: 8,
					shiftType: ShiftType.DAYS,
					occupationId,
					specialtyId,
					departmentId: dept.id,
					locationId: dept.locationId,
					shiftRate: 72,
					vendorRate: 58,
					totalCost: 72 * 8,
					status: PerDiemShiftStatus.COMPLETED,
					isPublic: true,
					isUrgent: false,
				},
				select: { id: true },
			});

			await prisma.perDiemAssignment.create({
				data: {
					shiftId: doneShift.id,
					candidateId: candidate.id,
					vendorId,
				},
			});
			createdAssigned = true;
		}
	}

	return {
		createdOpen: openRows.length,
		createdAssigned,
		skipped: null,
	};
}

export async function seedVendorPerDiemShifts(
	prisma: PrismaClient,
): Promise<void> {
	const organizations = await prisma.organization.findMany({
		select: { id: true, slug: true, name: true },
		orderBy: { createdAt: "asc" },
	});

	if (organizations.length === 0) {
		console.log(
			"seedVendorPerDiemShifts: skipped — no organizations in database",
		);
		return;
	}

	for (const org of organizations) {
		const shiftPrefix = shiftPrefixForOrg(org.id, org.slug);
		const templateName = `${TEMPLATE_BASE_NAME} (${org.name})`;

		const orgVendor = await prisma.organizationVendor.findFirst({
			where: {
				organizationId: org.id,
				status: OrganizationVendorStatus.ACTIVE,
			},
			select: { vendorId: true },
			orderBy: { createdAt: "asc" },
		});

		const vendorId = orgVendor?.vendorId ?? null;

		const result = await seedShiftsForOrg(
			prisma,
			org.id,
			vendorId,
			shiftPrefix,
			templateName,
		);

		if (result.skipped?.startsWith("already")) {
			console.log(
				`seedVendorPerDiemShifts: org=${org.id} slug=${org.slug ?? "—"} — ${result.skipped}`,
			);
		} else if (result.skipped === "no department") {
			console.log(
				`seedVendorPerDiemShifts: org=${org.id} (${org.name}) — skipped (no department)`,
			);
		} else {
			console.log(
				`seedVendorPerDiemShifts: org=${org.id} (${org.name}) vendor=${vendorId ?? "none"} — ${result.createdOpen} OPEN` +
					(result.createdAssigned
						? " + 2 assigned"
						: vendorId
							? " (no vendor candidate for assigned demos)"
							: " (no ACTIVE organizationVendor — open shifts only)"),
			);
		}
	}
}

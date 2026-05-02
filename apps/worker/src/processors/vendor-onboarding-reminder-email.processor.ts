import type { PrismaClient } from "@repo/db";
import { PlacementStatus, Prisma } from "@repo/db";
import { candidateOnboardingReminderTemplate, sendMail } from "@repo/mail";
import type { VendorOnboardingReminderPayload } from "@repo/shared";
import { addDays, startOfDay } from "date-fns";
import { config } from "../config.js";

const UPCOMING_STATUSES: PlacementStatus[] = [
	PlacementStatus.UPCOMING,
	PlacementStatus.PENDING,
	PlacementStatus.ON_HOLD,
];

const WINDOW_DAYS = 21;

function buildCandidatePlacementUrl(slug: string, placementId: string): string {
	const base = config.orgPortalBaseUrl;
	if (!slug) return `${base}/placements/${placementId}`;
	try {
		const url = new URL(base);
		url.hostname = `${slug}.${url.hostname}`;
		return `${url.origin}/placements/${placementId}`;
	} catch {
		return `${base}/placements/${placementId}`;
	}
}

function formatStartDate(d: Date): string {
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function assignmentTitle(
	jobTitle: string | null,
	reqJobTitle: string | null,
	reqSummary: string | null,
): string {
	return (
		jobTitle?.trim() ||
		reqJobTitle?.trim() ||
		reqSummary?.trim() ||
		"Assignment"
	);
}

export async function runVendorOnboardingReminderEmailProcessor(
	prisma: PrismaClient,
	payload: VendorOnboardingReminderPayload,
): Promise<void> {
	const { organizationId, vendorId, placementId } = payload;

	const [org, vendor] = await Promise.all([
		prisma.organization.findUnique({
			where: { id: organizationId },
			select: { name: true, slug: true },
		}),
		prisma.vendor.findUnique({
			where: { id: vendorId },
			select: { name: true },
		}),
	]);

	const orgName = org?.name ?? "Organization";
	const vendorName = vendor?.name ?? "your staffing partner";
	const slug = org?.slug ?? "";

	const today = startOfDay(new Date());
	const windowEnd = addDays(today, WINDOW_DAYS);

	const upcomingStatusSql = Prisma.join(
		UPCOMING_STATUSES.map((s) => Prisma.sql`${s}::"PlacementStatus"`),
	);

	const rows = await prisma.$queryRaw<
		Array<{
			id: string;
			startDate: Date;
			jobTitle: string | null;
			candidateEmail: string | null;
			candidateName: string | null;
			reqJobTitle: string | null;
			reqJobSummary: string | null;
			pct: number;
		}>
	>`
		SELECT
			p.id,
			p."startDate" AS "startDate",
			p."jobTitle" AS "jobTitle",
			u.email AS "candidateEmail",
			u.name AS "candidateName",
			r."jobTitle" AS "reqJobTitle",
			r."jobSummary" AS "reqJobSummary",
			CASE
				WHEN COALESCE(COUNT(pci.id) FILTER (WHERE pci."removedAt" IS NULL), 0) = 0 THEN 100
				ELSE ROUND(
					100.0 * COALESCE(
						COUNT(pci.id) FILTER (
							WHERE pci."removedAt" IS NULL
								AND cc.status = 'APPROVED'::"CandidateComplianceStatus"
								AND (cc."expiryDate" IS NULL OR cc."expiryDate" > NOW())
						),
						0
					)::numeric
					/ NULLIF(COUNT(pci.id) FILTER (WHERE pci."removedAt" IS NULL), 0)
				)::integer
			END AS pct
		FROM placement p
		INNER JOIN candidate c ON c.id = p."candidateId" AND c."vendorId" = ${vendorId}::uuid
		INNER JOIN "user" u ON u.id = c."userId"
		LEFT JOIN submission s ON s.id = p."submissionId"
		LEFT JOIN requisition r ON r.id = s."requisitionId"
		LEFT JOIN placement_compliance_items pci ON pci."placementId" = p.id
		LEFT JOIN candidate_compliance cc
			ON cc."candidateId" = p."candidateId"
			AND cc."complianceListItemId" = pci."complianceListItemId"
		WHERE p.id = ${placementId}::uuid
			AND p."organizationId" = ${organizationId}::uuid
			AND p.status IN (${upcomingStatusSql})
			AND p."startDate" IS NOT NULL
			AND p."startDate" >= ${today}
			AND p."startDate" <= ${windowEnd}
		GROUP BY
			p.id,
			p."startDate",
			p."jobTitle",
			u.email,
			u.name,
			r."jobTitle",
			r."jobSummary"
	`;

	const p = rows[0];
	if (!p) {
		return;
	}

	const start = p.startDate;
	if (!start) return;

	const email = p.candidateEmail?.trim();
	if (!email) {
		return;
	}

	const role = assignmentTitle(p.jobTitle, p.reqJobTitle, p.reqJobSummary);
	const candidateName = p.candidateName?.trim() || "there";
	const pct = Number(p.pct ?? 0);

	const { subject, text } = candidateOnboardingReminderTemplate({
		orgName,
		vendorName,
		candidateName,
		jobTitle: role,
		startDateLabel: formatStartDate(start),
		compliancePercent: pct,
		candidatePortalUrl: buildCandidatePlacementUrl(slug, p.id),
	});

	await sendMail(config.mail, { to: email, subject, text });
}

"use client";

import { exportAsCSV } from "@repo/shared";
import type { TimeReportGroupByOption } from "@repo/ui/general/timekeeping/types";
import {
	flattenReportEntries,
	groupReportEntries,
} from "@repo/ui/general/timekeeping/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { useEntriesGrouped } from "@/queries/organization-timekeeping.queries";
import type { TimekeepingUrlState } from "./use-timekeeping-url-state";
import { REPORT_PAGE_SIZE, toLocationTimekeeping } from "./utils";

export function useTimeReportsTab(
	organizationId: string,
	urlState: TimekeepingUrlState,
) {
	const orgId = organizationId;
	const { searchFromUrl, dataSourceFilter } = urlState;
	const { fmtDateRange } = useUserTimezone();

	const [reportPage, setReportPage] = useState(1);
	const [groupBy, setGroupBy] = useState<TimeReportGroupByOption>("department");

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset list pages when debounced search changes
	useEffect(() => {
		setReportPage(1);
	}, [searchFromUrl]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset when data source filter changes
	useEffect(() => {
		setReportPage(1);
	}, [dataSourceFilter]);

	const reportsQuery = useEntriesGrouped(orgId, {
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		search: searchFromUrl || undefined,
		page: reportPage,
		limit: REPORT_PAGE_SIZE,
	});

	const reportLocations = useMemo(
		() => (reportsQuery.data?.data ?? []).map(toLocationTimekeeping),
		[reportsQuery.data],
	);

	const reportTotalPages = reportsQuery.data?.totalPages ?? 1;

	const reportEntries = useMemo(
		() => flattenReportEntries(reportLocations),
		[reportLocations],
	);

	const groupedReportData = useMemo(
		() => groupReportEntries(reportEntries, groupBy),
		[reportEntries, groupBy],
	);

	const handleExportTimeReports = useCallback(() => {
		const data = reportEntries.map((e) => ({
			Worker: e.workerName,
			Location: e.location,
			Department: e.department,
			Date: fmtDateRange(e.startDate, e.endDate),
			"Pay Code": e.payCode,
			Hours: e.hours,
			Source: e.source === "MOBILE_APP" ? "Mobile App" : "File Upload",
			Notes: e.notes || "",
		}));
		exportAsCSV(data, `time_reports_${new Date().toISOString().split("T")[0]}`);
	}, [reportEntries, fmtDateRange]);

	return {
		groupBy,
		setGroupBy,
		groupedReportData,
		handleExportTimeReports,
		reportPage,
		setReportPage,
		reportTotalPages,
	};
}

export type TimeReportsTabState = ReturnType<typeof useTimeReportsTab>;

"use client";

import { exportAsCSV } from "@repo/shared";
import type {
	TimeReportGroupByOption,
	TimeReportHandlers,
	TimeReportState,
} from "@repo/ui/general/timekeeping/types";
import {
	flattenReportEntries,
	groupReportEntries,
} from "@repo/ui/general/timekeeping/utils";
import { useMemo, useState } from "react";
import { MOCK_TIMEKEEPING_LOCATIONS } from "@/constants/timekeeping";

export function useTimeReportsTab() {
	const [groupBy, setGroupBy] = useState<TimeReportGroupByOption>("department");

	const reportEntries = useMemo(
		() => flattenReportEntries(MOCK_TIMEKEEPING_LOCATIONS),
		[],
	);

	const groupedReportData = useMemo(
		() => groupReportEntries(reportEntries, groupBy),
		[reportEntries, groupBy],
	);

	const handleExportTimeReports = () => {
		const data = reportEntries.map((e) => ({
			Worker: e.workerName,
			Location: e.location,
			Department: e.department,
			"Start Date": e.startDate,
			"End Date": e.endDate,
			"Pay Code": e.payCode,
			Hours: e.hours,
			Source: e.source === "MOBILE_APP" ? "Mobile App" : "File Upload",
			Notes: e.notes || "",
		}));

		const fileName = `time_reports_${new Date().toISOString().split("T")[0]}`;
		exportAsCSV(data, fileName);
	};

	const state: TimeReportState = {
		groupBy,
		groupedData: groupedReportData,
	};

	const handlers: TimeReportHandlers = {
		setGroupBy,
		handleExport: handleExportTimeReports,
	};

	return { state, handlers };
}

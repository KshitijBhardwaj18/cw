/** Weekly timecard row in the submit dialog (synced with API on save/submit). */
export interface TimeEntryRow {
	id: string;
	/** Regular week row: fixed label. Overtime: use `workDate` + calendar. */
	isOvertime: boolean;
	weekLabel?: string;
	/** Overtime only — `yyyy-MM-dd` from `DatePicker` */
	workDate?: string;
	start: string;
	end: string;
	breakMin: string;
	payCodeId?: string;
}

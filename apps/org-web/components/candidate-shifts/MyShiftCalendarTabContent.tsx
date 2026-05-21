"use client";

import { formatUsdPerHour } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { addMonths, format, isSameDay, parseISO, subMonths } from "date-fns";
import {
	Briefcase,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock,
	MapPin,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { useCandidateShiftsCalendar } from "@/queries/candidate-shifts.queries";
import type { CandidateShiftListItem } from "@/types/candidate-shifts";

export function MyShiftCalendarTabContent() {
	const [month, setMonth] = useState<Date>(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const year = month.getFullYear();
	const monthNum = month.getMonth() + 1;

	const { data, isPending } = useCandidateShiftsCalendar(year, monthNum);

	const shifts = data?.shifts ?? [];

	const shiftDates = shifts.map((s) => parseISO(s.date));

	const shiftsForDay = (date: Date): CandidateShiftListItem[] =>
		shifts.filter((s) => isSameDay(parseISO(s.date), date));

	const shiftsOnSelected = selectedDate ? shiftsForDay(selectedDate) : [];

	const handleMonthChange = (dir: "prev" | "next") => {
		setSelectedDate(null);
		setMonth((m) => (dir === "prev" ? subMonths(m, 1) : addMonths(m, 1)));
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div>
						<CardTitle className="text-xl font-bold">
							{format(month, "MMMM yyyy")}
						</CardTitle>
						<CardDescription>View your scheduled shifts</CardDescription>
					</div>
					<CardAction className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleMonthChange("prev")}
							className="size-8"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleMonthChange("next")}
							className="size-8"
						>
							<ChevronRight className="size-4" />
						</Button>
					</CardAction>
				</CardHeader>

				<CardContent>
					{isPending ? (
						<div className="grid grid-cols-7 gap-3">
							{Array.from({ length: 35 }).map((_, i) => (
								<Skeleton key={i} className="h-24 rounded-xl" />
							))}
						</div>
					) : (
						<Calendar
							mode="multiple"
							selected={shiftDates}
							month={month}
							onMonthChange={setMonth}
							formatters={{
								formatWeekdayName: (date) => format(date, "EEE").toUpperCase(),
							}}
							className="w-full p-0 [&_table]:w-full"
							classNames={{
								root: "w-full font-sans",
								months: "w-full",
								month: "w-full",
								month_caption: "hidden",
								nav: "hidden",
								table: "w-full block",
								weekdays: "grid grid-cols-7 w-full mb-2",
								weekday:
									"text-muted-foreground font-semibold text-xs text-center uppercase",
								week: "grid grid-cols-7 w-full gap-3 mt-3",
								day: cn(
									"relative h-24 w-full border rounded-xl bg-card p-0 overflow-hidden",
								),
								today: "border-primary ring-1 ring-primary bg-primary/5",
								outside: "opacity-40",
							}}
							components={{
								DayButton: ({ day, modifiers, ...props }) => {
									const isToday = isSameDay(day.date, new Date());
									const dayShifts = shiftsForDay(day.date);
									const hasShift = dayShifts.length > 0;
									const isSelected =
										selectedDate && isSameDay(day.date, selectedDate);

									return (
										<button
											type="button"
											{...props}
											onClick={() =>
												hasShift
													? setSelectedDate(isSelected ? null : day.date)
													: undefined
											}
											className={cn(
												"p-1.5 h-full w-full flex flex-col justify-between transition-colors",
												hasShift
													? "cursor-pointer hover:bg-muted/50"
													: "cursor-default pointer-events-none",
												isSelected && "bg-primary/10",
											)}
										>
											<span
												className={cn(
													"text-sm font-semibold",
													isToday ? "text-primary" : "text-foreground",
												)}
											>
												{format(day.date, "d")}
											</span>

											{isToday && !hasShift && (
												<span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded self-start">
													Today
												</span>
											)}

											{hasShift && (
												<div className="flex flex-col gap-0.5 min-h-0">
													{dayShifts.slice(0, 2).map((s) => (
														<div
															key={s.id}
															className={cn(
																"flex px-1.5 py-0.5 items-center gap-1 rounded text-white",
																"bg-primary text-[10px] font-medium leading-tight truncate",
															)}
														>
															<Clock className="size-2.5 shrink-0" />
															<span className="truncate">{s.startTime}</span>
														</div>
													))}
													{dayShifts.length > 2 && (
														<div className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-semibold">
															+{dayShifts.length - 2} more
														</div>
													)}
												</div>
											)}
										</button>
									);
								},
							}}
						/>
					)}
				</CardContent>

				<CardFooter className="justify-center gap-6 border-t">
					<div className="flex items-center gap-2">
						<div className="size-6 bg-primary rounded" />
						<span className="text-sm font-medium text-muted-foreground">
							Days with shifts
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="px-3 py-1 text-primary border border-primary rounded-full text-sm font-bold">
							{format(new Date(), "d")}
						</div>
						<span className="text-sm font-medium text-muted-foreground">
							Today
						</span>
					</div>
					{shifts.length > 0 && (
						<div className="flex items-center gap-2">
							<CalendarIcon className="size-4 text-muted-foreground" />
							<span className="text-sm font-medium text-muted-foreground">
								{shifts.length} shift{shifts.length !== 1 ? "s" : ""} this month
							</span>
						</div>
					)}
				</CardFooter>
			</Card>

			{selectedDate && shiftsOnSelected.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base font-bold">
							{format(selectedDate, "EEEE, MMMM d, yyyy")}
						</CardTitle>
						<CardDescription>
							{shiftsOnSelected.length} shift
							{shiftsOnSelected.length !== 1 ? "s" : ""} scheduled
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{shiftsOnSelected.map((shift) => (
							<div
								key={shift.id}
								className="rounded-lg border bg-card p-4 space-y-3"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="space-y-1 min-w-0">
										<p className="text-sm font-semibold text-foreground truncate">
											{shift.title}
										</p>
										<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
											<span className="flex items-center gap-1">
												<Clock className="size-3" />
												{shift.startTime} – {shift.endTime}
											</span>
											<span className="flex items-center gap-1">
												<Briefcase className="size-3" />
												{shift.occupation}
												{shift.specialty && ` · ${shift.specialty}`}
											</span>
											<span className="flex items-center gap-1">
												<MapPin className="size-3" />
												{shift.location}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1.5 shrink-0">
										{shift.isUrgent && (
											<Badge variant="error" className="text-xs">
												<Zap className="size-3" />
												Urgent
											</Badge>
										)}
										<Badge variant="success" className="text-xs">
											{formatUsdPerHour(shift.ratePerHour)}
										</Badge>
									</div>
								</div>
								{shift.department && (
									<p className="text-xs text-muted-foreground">
										Department: {shift.department}
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

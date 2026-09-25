import { format, isValid } from "date-fns";
import { TZDate } from "react-day-picker";
import { studioTimeZone } from "./dates";

export function parseDateInput(value: string | null, includeTime: boolean) {
	if (!value) return undefined;
	let date: TZDate;
	if (includeTime) {
		date = new TZDate(value, studioTimeZone);
	} else {
		const [year, month, day] = value.split("-").map(Number);
		date = new TZDate(year, month - 1, day, studioTimeZone);
	}
	return isValid(date) ? date : undefined;
}

export function changeDateInputDay(
	day: Date,
	includeTime: boolean,
	previous?: Date,
) {
	const date = new TZDate(day, studioTimeZone);
	if (!includeTime) return format(date, "yyyy-MM-dd");
	const previousDate = previous && new TZDate(previous, studioTimeZone);
	date.setHours(
		previousDate?.getHours() ?? 9,
		previousDate?.getMinutes() ?? 0,
		0,
		0,
	);
	return new Date(date.getTime()).toISOString();
}

export function changeDateInputTime(time: string, previous?: Date) {
	const [hours, minutes] = time.split(":").map(Number);
	const date = new TZDate(previous?.getTime() ?? Date.now(), studioTimeZone);
	date.setHours(hours, minutes, 0, 0);
	return new Date(date.getTime()).toISOString();
}

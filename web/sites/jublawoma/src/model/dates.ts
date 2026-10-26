/*
 * Date rendering policy for the whole site: locale pinned to "de-CH" and one
 * explicit timezone (Europe/Zurich, where the club lives), so rendered output
 * never depends on the runtime locale or the host timezone. Date-only values
 * ("2026-10-25") get a midday anchor before formatting, so the calendar day
 * cannot drift into a neighbouring day in any host timezone.
 */

const dayFormatter = new Intl.DateTimeFormat("de-CH", {
	timeZone: "Europe/Zurich",
});
const eventDayFormatter = new Intl.DateTimeFormat("de-CH", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: "Europe/Zurich",
});
const longDayFormatter = new Intl.DateTimeFormat("de-CH", {
	day: "2-digit",
	month: "long",
	year: "numeric",
	timeZone: "Europe/Zurich",
});

function anchorDateOnly(value: string): Date {
	return new Date(`${value}T12:00:00Z`);
}

export function formatDate(value: string): string {
	return dayFormatter.format(anchorDateOnly(value));
}

export function formatEventDates(from: string, to = from): string {
	const start = eventDayFormatter.format(anchorDateOnly(from));
	return from === to
		? start
		: `${start} – ${eventDayFormatter.format(anchorDateOnly(to))}`;
}

export function formatDonationDates(start: string, end: string): string {
	const first = new Date(start);
	const last = new Date(end);
	if (Number.isNaN(first.valueOf()) || Number.isNaN(last.valueOf())) return "";
	const firstDay = longDayFormatter.format(first);
	// A range within one calendar day reads as that day once, never twice.
	return firstDay === longDayFormatter.format(last)
		? firstDay
		: `${firstDay} – ${longDayFormatter.format(last)}`;
}

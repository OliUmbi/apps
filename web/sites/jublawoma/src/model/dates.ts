const dateFormatter = new Intl.DateTimeFormat("de-CH", { timeZone: "UTC" });
const eventDateFormatter = new Intl.DateTimeFormat("de-CH", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

export function formatDate(value: string): string {
	return dateFormatter.format(new Date(`${value}T12:00:00Z`));
}

export function formatEventDates(from: string, to = from): string {
	const start = eventDateFormatter.format(new Date(`${from}T12:00:00Z`));
	return from === to
		? start
		: `${start} – ${eventDateFormatter.format(new Date(`${to}T12:00:00Z`))}`;
}

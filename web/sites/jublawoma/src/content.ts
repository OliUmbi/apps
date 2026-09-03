export function dateLabel(from: string, to = from) {
	const format = new Intl.DateTimeFormat("de-CH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const start = format.format(new Date(`${from}T12:00:00`));
	return from === to
		? start
		: `${start} – ${format.format(new Date(`${to}T12:00:00`))}`;
}

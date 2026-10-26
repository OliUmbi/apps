/*
 * Calendar dates render from their own parts in the site's locale: parsing the
 * stored "yyyy-mm-dd" as a local timestamp shifts the printed day between the
 * server and the client at timezone edges (U-14).
 */
export function formatMonthYear(isoDate: string, locale: string): string {
	const [year, month] = isoDate.split("-").map(Number);
	if (!year || !month) return "";
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, month - 1, 1)));
}

/*
 * Date rendering policy for the whole site: locale pinned to "de-CH" and one
 * explicit timezone (Europe/Zurich, where the farm lives), so rendered output
 * never depends on the runtime locale or the host timezone. Date-only values
 * ("2025-06-01") get a midday anchor before formatting, so the calendar day
 * cannot drift into a neighbouring day in any host timezone. Dates are
 * formatted server-side and rendered as `<time dateTime>`.
 */

const articleDayFormatter = new Intl.DateTimeFormat("de-CH", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/Zurich",
});

export function formatArticleDate(value: string): string {
	return articleDayFormatter.format(new Date(`${value}T12:00:00Z`));
}

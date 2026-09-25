export const studioTimeZone = "Europe/Zurich";

const dateFormatter = new Intl.DateTimeFormat("de-CH", {
	dateStyle: "medium",
	timeZone: studioTimeZone,
});
const timestampFormatter = new Intl.DateTimeFormat("de-CH", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: studioTimeZone,
});

export function formatDate(value: string | null) {
	return value ? dateFormatter.format(new Date(`${value}T12:00:00Z`)) : "—";
}

export function formatTimestamp(value: string | null) {
	return value ? timestampFormatter.format(new Date(value)) : "—";
}

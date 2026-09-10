const MILLISECONDS_PER_MINUTE = 60_000;

export function localDateTime(value: string): string {
	const date = new Date(value);
	const localTime =
		date.getTime() - date.getTimezoneOffset() * MILLISECONDS_PER_MINUTE;
	return new Date(localTime).toISOString().slice(0, 16);
}

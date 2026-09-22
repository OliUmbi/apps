export function safeLinkHref(value: string): string | undefined {
	const href = value.trim();
	if (
		!href ||
		Array.from(href).some(
			(character) =>
				character.charCodeAt(0) <= 32 ||
				character.charCodeAt(0) === 127 ||
				character === "\\",
		)
	)
		return undefined;
	if (href.startsWith("#")) return href;
	if (href.startsWith("/") && !href.startsWith("//")) return href;
	try {
		return ["https:", "http:", "mailto:"].includes(new URL(href).protocol)
			? href
			: undefined;
	} catch {
		return undefined;
	}
}

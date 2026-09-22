import { limits } from "@oliumbi/contracts";

export function slugify(value: string): string {
	return value
		.replace(/ä/gi, "ae")
		.replace(/ö/gi, "oe")
		.replace(/ü/gi, "ue")
		.replace(/ß/g, "ss")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.slice(0, limits.name)
		.replace(/^-+|-+$/g, "");
}

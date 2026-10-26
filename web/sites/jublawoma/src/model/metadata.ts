import { m } from "@oliumbi/i18n/messages";
import { absoluteUrl } from "./links";

/*
 * Per-route head entries. The root route keeps the site-wide defaults and the
 * deepest matching route wins per attribute, so a page overrides only the
 * entries it sets here.
 */
export function pageHead(options: {
	title: string;
	description?: string;
	image?: string | null;
}) {
	const title = `${options.title} · ${m.jublawoma_brand()}`;
	const meta: Record<string, string>[] = [
		{ title },
		{ property: "og:title", content: title },
	];
	if (options.description) {
		meta.push({ name: "description", content: options.description });
		meta.push({ property: "og:description", content: options.description });
	}
	if (options.image)
		meta.push({ property: "og:image", content: absoluteUrl(options.image) });
	return { meta };
}

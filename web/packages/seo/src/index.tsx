import type { ReactElement } from "react";

/*
 * SEO surfaces shared by the three public sites. The canonical link and the
 * JSON-LD block render from the root component; React 19 hoists <link> and
 * <meta> into <head>. Sitemaps stay server-side (./sitemap).
 */

export function absoluteUrl(origin: string, path: string): string {
	return new URL(path, origin).href;
}

export function Canonical({
	origin,
	path,
}: {
	origin: string;
	path: string;
}): ReactElement {
	const href = absoluteUrl(origin, path);
	return (
		<>
			<link rel="canonical" href={href} />
			<meta property="og:url" content={href} />
		</>
	);
}

export function JsonLd({ data }: { data: object }): ReactElement {
	return (
		<script
			type="application/ld+json"
			// JSON.stringify output is data, never markup from a user field.
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

export interface LocalBusinessInput {
	name: string;
	url: string;
	street?: string;
	postalCode?: string;
	city?: string;
	email?: string;
	phone?: string;
}

export function localBusinessJsonLd(input: LocalBusinessInput) {
	return {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: input.name,
		url: input.url,
		...(input.street || input.postalCode || input.city
			? {
					address: {
						"@type": "PostalAddress",
						...(input.street ? { streetAddress: input.street } : {}),
						...(input.postalCode ? { postalCode: input.postalCode } : {}),
						...(input.city ? { addressLocality: input.city } : {}),
						addressCountry: "CH",
					},
				}
			: {}),
		...(input.email ? { email: input.email } : {}),
		...(input.phone ? { telephone: input.phone } : {}),
	};
}

export function organizationJsonLd(input: { name: string; url: string }) {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: input.name,
		url: input.url,
	};
}

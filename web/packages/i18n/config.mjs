// Single source of truth for the Paraglide compiler options. Every writer of
// the shared generated output in src/paraglide (`pnpm generate`, the site Vite
// plugins, production builds) must use these options, so repeated and
// concurrent generations produce identical files.
import { fileURLToPath } from "node:url";

export const project = fileURLToPath(
	new URL("./project.inlang", import.meta.url),
);

export const outdir = fileURLToPath(
	new URL("./src/paraglide", import.meta.url),
);

/** @type {import("@inlang/paraglide-js").CompilerOptions} */
export const paraglideOptions = {
	project,
	outdir,
	strategy: ["url", "baseLocale"],
	cookieName: "site_locale",
	// Pin the output structure for every writer. Upstream defaults to
	// "locale-modules" during dev and "message-modules" for builds, which would
	// make dev servers and builds rewrite the shared output in different shapes.
	outputStructure: "message-modules",
	// The same tree-shaking flag the Vite plugin picks, so generated files are
	// byte-identical no matter which writer produced them.
	isServer: "import.meta.env?.SSR ?? typeof window === 'undefined'",
	// German public paths. The router's input/output rewrite maps these to the
	// English route ids, so route files and type-safe links stay English while
	// the address bar, sitemaps and canonical URLs are German.
	urlPatterns: [
		{ pattern: "/about", localized: [["de-CH", "/ueber-uns"]] },
		{ pattern: "/contact", localized: [["de-CH", "/kontakt"]] },
		{ pattern: "/crops", localized: [["de-CH", "/anbau"]] },
		{ pattern: "/products", localized: [["de-CH", "/produkte"]] },
		{
			pattern: "/products/:productId",
			localized: [["de-CH", "/produkte/:productId"]],
		},
		{ pattern: "/latest", localized: [["de-CH", "/aktuelles"]] },
		{ pattern: "/latest/:slug", localized: [["de-CH", "/aktuelles/:slug"]] },
		{ pattern: "/events", localized: [["de-CH", "/anlaesse"]] },
		{ pattern: "/stories", localized: [["de-CH", "/geschichten"]] },
		{
			pattern: "/stories/:slug",
			localized: [["de-CH", "/geschichten/:slug"]],
		},
		{ pattern: "/donations", localized: [["de-CH", "/spenden"]] },
		{ pattern: "/join", localized: [["de-CH", "/beitreten"]] },
		{ pattern: "/services", localized: [["de-CH", "/angebot"]] },
		{ pattern: "/showcases", localized: [["de-CH", "/referenzen"]] },
		{
			pattern: "/showcases/:slug",
			localized: [["de-CH", "/referenzen/:slug"]],
		},
		{ pattern: "/inquiry", localized: [["de-CH", "/anfrage"]] },
		{ pattern: "/review", localized: [["de-CH", "/bewertung"]] },
		{ pattern: "/privacy", localized: [["de-CH", "/datenschutz"]] },
		{ pattern: "/legal", localized: [["de-CH", "/impressum"]] },
		{ pattern: "/terms", localized: [["de-CH", "/agb"]] },
	],
};

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
};

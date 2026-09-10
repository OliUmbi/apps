import { fileURLToPath } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
export function i18nPlugin() {
	return paraglideVitePlugin({
		project: fileURLToPath(new URL("./project.inlang", import.meta.url)),
		outdir: fileURLToPath(new URL("./src/paraglide", import.meta.url)),
		strategy: ["url", "baseLocale"],
		cookieName: "site_locale",
	});
}

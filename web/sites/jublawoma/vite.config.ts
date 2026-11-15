import { configureEnvironment } from "@oliumbi/environment/vite";
import { i18nPlugin } from "@oliumbi/i18n/vite";
import tailwindCss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
	...configureEnvironment(mode, import.meta.url),
	server: { port: 8001 },
	resolve: { tsconfigPaths: true },
	plugins: [
		i18nPlugin(),
		// The site ships one small stylesheet; inlining it removes the
		// render-blocking round trip before first paint.
		tanstackStart({ server: { build: { inlineCss: true } } }),
		nitro(),
		viteReact(),
		tailwindCss(),
	],
}));

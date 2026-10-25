import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { paraglideOptions } from "./config.mjs";
import { withGenerationLock } from "./lock.mjs";

type HookFn = (this: unknown, ...args: unknown[]) => unknown;
type Hook = HookFn | { handler: HookFn } | undefined;

// Runs a plugin compile hook under the shared cross-process generation lock so
// concurrent dev servers and builds cannot interleave writes into the shared
// output directory (see lock.mjs).
function serializeCompileHook(hook: Hook): Hook {
	if (typeof hook === "function") {
		return function (this: unknown, ...args: unknown[]) {
			return withGenerationLock(() => hook.apply(this, args));
		};
	}
	if (hook && typeof hook.handler === "function") {
		const { handler } = hook;
		return {
			...hook,
			handler: function (this: unknown, ...args: unknown[]) {
				return withGenerationLock(() => handler.apply(this, args));
			},
		};
	}
	return hook;
}

export function i18nPlugin() {
	const generated = paraglideVitePlugin(paraglideOptions);
	const plugins = Array.isArray(generated) ? generated : [generated];
	return plugins.map((plugin) => {
		const hooks = plugin as unknown as {
			buildStart?: Hook;
			watchChange?: Hook;
		};
		return {
			...plugin,
			buildStart: serializeCompileHook(hooks.buildStart),
			watchChange: serializeCompileHook(hooks.watchChange),
		} as typeof plugin;
	});
}

// The single explicit owner of the generated message runtime in src/paraglide.
// Run it through `pnpm generate` from web/; `pnpm typecheck` runs it first, so
// a clean checkout type-checks without a build. The upstream CLI
// (`paraglide-js compile`) cannot boot in the installed dependency tree
// (@inlang/recommend-sherlock ships a broken dist), so this entry calls the
// compiler API directly with the shared options from config.mjs.
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { compile } from "@inlang/paraglide-js";
import { outdir, paraglideOptions } from "./config.mjs";
import { withGenerationLock } from "./lock.mjs";

// Mirrors the compiler's on-disk hashing so an existing output tree seeds the
// incremental compile: only changed files are rewritten and files for removed
// messages are deleted, without wiping the directory out from under readers.
async function hashExistingOutput(directory) {
	try {
		if (!(await stat(directory)).isDirectory()) {
			return undefined;
		}
	} catch {
		return undefined;
	}
	const hashes = {};
	async function walk(currentDirectory, prefix) {
		for (const entry of await readdir(currentDirectory, {
			withFileTypes: true,
		})) {
			const key = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				await walk(resolve(currentDirectory, entry.name), key);
			} else if (entry.isFile()) {
				const content = await readFile(
					resolve(currentDirectory, entry.name),
					"utf-8",
				);
				hashes[key] = createHash("sha256")
					.update(content + resolve(directory, key))
					.digest("hex");
			}
		}
	}
	await walk(directory, "");
	return hashes;
}

await withGenerationLock(async () => {
	const { outputHashes } = await compile({
		...paraglideOptions,
		cleanOutdir: false,
		previousCompilation: { outputHashes: await hashExistingOutput(outdir) },
	});
	const files = Object.keys(outputHashes ?? {}).length;
	console.log(`Generated ${files} files in ${outdir}`);
});

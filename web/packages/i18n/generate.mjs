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

// Seeds the compile state from disk for this fresh process. Paraglide 3
// derives its incremental write plan from the previousCompilation state
// object instead of accepting raw hashes (upstream seeds it internally with
// seedPreviousCompilationFromOutdir, which is not publicly exported). The
// hash formula matches the compiler's own hashDirectory - sha256 of content
// plus absolute path - so unchanged files skip the write, files for removed
// messages are deleted, and concurrent readers never see the shared output
// directory emptied or rewritten.
async function seedPreviousCompilation() {
	try {
		if (!(await stat(outdir)).isDirectory()) {
			return undefined;
		}
	} catch {
		return undefined;
	}
	const outputHashes = {};
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
				outputHashes[key] = createHash("sha256")
					.update(content + resolve(outdir, key))
					.digest("hex");
			}
		}
	}
	await walk(outdir, "");
	return { outputHashes };
}

await withGenerationLock(async () => {
	const previousCompilation = await seedPreviousCompilation();
	const { outputHashes } = await compile({
		...paraglideOptions,
		cleanOutdir: false,
		...(previousCompilation ? { previousCompilation } : {}),
	});
	const files = Object.keys(outputHashes ?? {}).length;
	console.log(`Generated ${files} files in ${outdir}`);
});

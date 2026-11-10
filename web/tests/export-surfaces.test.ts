import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

/*
 * Guards for the deliberate package boundaries (W-12/W-14):
 *  - export maps are explicit (no wildcards) and never reach schema/tokens
 *    internals,
 *  - every `@oliumbi/...` specifier in the sources resolves through its
 *    package's export map,
 *  - no two entry points of one package export the same value name (a name a
 *    compiler auto-import could pick twice is exactly the W-11 hazard),
 *  - every workspace package is either scanned or explicitly excluded.
 *
 * The runtime scan covers value exports; type-name uniqueness is enforced at
 * compile time (`pnpm typecheck`) through the explicit per-file entry points.
 */

const webRoot = path.resolve(import.meta.dirname, "..");
const packagesRoot = path.join(webRoot, "packages");
const skipDirectories = new Set([
	"node_modules",
	"paraglide",
	".git",
	"dist",
	".output",
	".tanstack",
]);

interface PackageSurface {
	name: string;
	directory: string;
	entries: [string, string][];
}

function packageSurfaces(): PackageSurface[] {
	return fs
		.readdirSync(packagesRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const directory = path.join(packagesRoot, entry.name);
			const manifest = JSON.parse(
				fs.readFileSync(path.join(directory, "package.json"), "utf8"),
			) as { name: string; exports: Record<string, string> };
			return {
				name: manifest.name,
				directory,
				entries: Object.entries(manifest.exports),
			};
		});
}

function sourceFiles(directory: string, into: string[] = []): string[] {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (skipDirectories.has(entry.name)) continue;
			sourceFiles(path.join(directory, entry.name), into);
		} else if (/\.tsx?$/.test(entry.name)) {
			into.push(path.join(directory, entry.name));
		}
	}
	return into;
}

test("export maps are explicit entry points and never expose internals", () => {
	for (const surface of packageSurfaces()) {
		for (const [subpath, target] of surface.entries) {
			assert.ok(
				!subpath.includes("*"),
				`${surface.name} exports a wildcard subpath: ${subpath}`,
			);
			assert.ok(
				fs.existsSync(path.join(surface.directory, target)),
				`${surface.name} ${subpath} points at a missing file: ${target}`,
			);
			assert.ok(
				!/(^|\/)(schema|.*\.tokens)\.ts$/.test(target),
				`${surface.name} ${subpath} reaches an internal module: ${target}`,
			);
		}
	}
});

test("every @oliumbi specifier resolves through its package export map", () => {
	const byName = new Map(
		packageSurfaces().map((surface) => [surface.name, surface]),
	);
	const sourceRoots = ["packages", "sites", "tests"].map((name) =>
		path.join(webRoot, name),
	);
	for (const root of sourceRoots) {
		for (const file of sourceFiles(root)) {
			const text = fs.readFileSync(file, "utf8");
			for (const match of text.matchAll(
				/["'](@oliumbi\/[A-Za-z0-9._/-]+)["']/g,
			)) {
				const specifier = match[1];
				const [name, ...rest] = specifier.split("/");
				const packageName = rest.length ? `${name}/${rest[0]}` : name;
				const surface = byName.get(packageName);
				assert.ok(surface, `${file}: unknown package in ${specifier}`);
				const subpath = rest.length > 1 ? `./${rest.slice(1).join("/")}` : ".";
				assert.ok(
					surface.entries.some(([key]) => key === subpath),
					`${file}: ${specifier} is not an entry of ${packageName}`,
				);
			}
		}
	}
});

// Every value name is unique across one package's entry points, so an editor
// auto-import cannot silently pick the workflow instead of the CRUD factory.
const runtimePackages = [
	"assets",
	"contracts",
	"database",
	"http-client",
	"identity",
	"jublawoma-data",
	"messaging",
	"queue",
	"query",
	"ui",
	"unclet-data",
	"zelglihof-data",
];

// Build-time packages whose entry points are not part of the runtime surface.
const nonRuntimePackages = new Set(["environment", "i18n"]);

test("every workspace package is scanned for duplicate exports", () => {
	const onDisk = fs
		.readdirSync(packagesRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
	// A new package must be added to the runtime scan or deliberately excluded:
	// it cannot silently skip the duplicate-export guard.
	assert.deepEqual(
		[...runtimePackages, ...nonRuntimePackages].sort(),
		onDisk,
		"add the package to runtimePackages or document the exclusion",
	);
});

test("no two entry points of a package export the same value name", async () => {
	for (const surface of packageSurfaces()) {
		const shortName = surface.name.replace("@oliumbi/", "");
		if (!runtimePackages.includes(shortName)) continue;
		const owners = new Map<string, string>();
		for (const [subpath, target] of surface.entries) {
			const module = (await import(
				pathToFileURL(path.join(surface.directory, target)).href
			)) as Record<string, unknown>;
			for (const name of Object.keys(module)) {
				const previous = owners.get(name);
				assert.equal(
					previous,
					undefined,
					`${surface.name}: ${name} is exported by both ${previous} and ${subpath}`,
				);
				owners.set(name, subpath);
			}
		}
	}
});

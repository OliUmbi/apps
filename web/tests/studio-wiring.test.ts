import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/*
 * TD-10 accepted the residual risk that a new Studio server function forgets
 * its authorization middleware. This structural guard closes that gap: every
 * createServerFn in the Studio server directory must apply
 * studioAuthorization/authenticatedAuthorization, except the public session
 * endpoints. The asset route is checked separately because it is a plain route
 * handler, not a server function.
 */

const studioRoot = path.join(
	import.meta.dirname,
	"..",
	"sites",
	"studio",
	"src",
);
const serverRoot = path.join(studioRoot, "server");

/** Server functions that are deliberately public (login/logout/session probe). */
const publicFunctions = new Set(["session.functions.ts"]);

function functionFiles(directory: string): string[] {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(directory, entry.name);
		if (entry.isDirectory()) return functionFiles(full);
		return entry.name.endsWith(".functions.ts") ? [full] : [];
	});
}

test("every Studio server function applies an authorization middleware", () => {
	const files = functionFiles(serverRoot);
	assert.ok(
		files.length >= 20,
		`expected the server functions, found ${files.length}`,
	);

	for (const file of files) {
		const blocks = fs
			.readFileSync(file, "utf8")
			.split("createServerFn(")
			.slice(1);
		assert.ok(blocks.length > 0, `${relative(file)} has no server function`);
		if (publicFunctions.has(path.basename(file))) continue;
		for (const block of blocks) {
			const handlerAt = block.indexOf(".handler(");
			const head = handlerAt >= 0 ? block.slice(0, handlerAt) : block;
			assert.match(
				head,
				/\.middleware\(\[[\s\S]*?(studioAuthorization|authenticatedAuthorization)/,
				`${relative(file)}: a server function has no authorization middleware`,
			);
		}
	}
});

test("the Studio asset route checks the actor", () => {
	const route = fs.readFileSync(
		path.join(studioRoot, "routes", "api.assets.$id.ts"),
		"utf8",
	);
	assert.match(route, /requireActor\(/);
});

function relative(file: string) {
	return path.relative(studioRoot, file);
}

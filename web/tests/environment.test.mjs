import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { environmentValues } = await jiti.import(
	"../packages/environment/src/vite.ts",
);

test("local environment loads shared server values and site/mode overrides", async () => {
	const root = await mkdtemp(join(tmpdir(), "web-environment-test-"));
	const site = join(root, "site");
	try {
		await mkdir(site);
		await writeFile(
			join(root, ".env"),
			"TEST_SHARED_PASSWORD=local-test-only\nTEST_SITE_VALUE=root\nVITE_TEST_PUBLIC_URL=https://public.example.test\n",
		);
		await writeFile(
			join(root, ".env.development"),
			"TEST_MODE_VALUE=development\n",
		);
		await writeFile(join(site, ".env.local"), "TEST_SITE_VALUE=site\n");
		const values = environmentValues("development", root, site);
		assert.equal(values.TEST_SHARED_PASSWORD, "local-test-only");
		assert.equal(values.TEST_SITE_VALUE, "site");
		assert.equal(values.TEST_MODE_VALUE, "development");
		assert.equal(values.VITE_TEST_PUBLIC_URL, "https://public.example.test");
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

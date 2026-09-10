import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createAssetsClient } = await jiti.import(
	"../packages/assets/src/index.ts",
);
const { configureEnvironment } = await jiti.import(
	"../packages/environment/src/vite.ts",
);
const serviceUrl = process.env.TEST_ASSETS_URL;

test("assets client uploads, scopes, publishes and deletes an image through Java", {
	skip: !serviceUrl,
}, async () => {
	assert.ok(
		["127.0.0.1", "localhost"].includes(new URL(serviceUrl).hostname),
		"Use a local disposable service",
	);
	assert.match(new URL(process.env.TEST_DATABASE_URL).pathname, /_test$/);
	configureEnvironment(
		"test",
		new URL("../sites/studio/vite.config.ts", import.meta.url).href,
	);
	const assets = createAssetsClient({
		baseUrl: () => serviceUrl,
		token: () => process.env.ASSETS_INTERNAL_AUTHORIZATION_TOKEN,
	});
	const bytes = await readFile(
		new URL(
			"../sites/jublawoma/public/assets/images/logos/logo.png",
			import.meta.url,
		),
	);
	const result = await assets.images.upload(
		"jublawoma",
		new File([bytes], "test-logo.png", { type: "image/png" }),
		{ visible: false },
	);
	const id = result.image.id;
	try {
		assert.equal(result.image.visible, false);
		assert.ok(result.variants.length > 0);
		await assert.rejects(() => assets.images.get("unclet", id));
		assert.equal(
			(await assets.images.content("jublawoma", id, "sm")).status,
			200,
		);
		assert.equal(
			(await fetch(`${serviceUrl}/images/${id}?size=sm`)).status,
			404,
		);
		await assets.images.visibility("jublawoma", id, true);
		assert.equal(
			(await fetch(`${serviceUrl}/images/${id}?size=sm`)).status,
			200,
		);
		assert.ok(
			(await assets.images.list("jublawoma")).items.some(
				(image) => image.id === id,
			),
		);
	} finally {
		await assets.images.delete("jublawoma", id);
	}
	await assert.rejects(() => assets.images.get("jublawoma", id));
});

test("document client preserves slug access and private content boundaries", {
	skip: !serviceUrl,
}, async () => {
	assert.match(new URL(process.env.TEST_DATABASE_URL).pathname, /_test$/);
	assert.ok(["127.0.0.1", "localhost"].includes(new URL(serviceUrl).hostname));
	configureEnvironment(
		"test",
		new URL("../sites/studio/vite.config.ts", import.meta.url).href,
	);
	const assets = createAssetsClient({
		baseUrl: () => serviceUrl,
		token: () => process.env.ASSETS_INTERNAL_AUTHORIZATION_TOKEN,
	});
	const bytes = await readFile(
		new URL(
			"../sites/jublawoma/public/assets/documents/Anmeldung-Jubla-Woma.pdf",
			import.meta.url,
		),
	);
	const slug = `test-${crypto.randomUUID()}`;
	const document = await assets.documents.upload(
		"jublawoma",
		new File([bytes], "registration.pdf", { type: "application/pdf" }),
		{ visible: false, slug },
	);
	try {
		assert.equal(document.slug, slug);
		assert.equal(
			(await assets.documents.content("jublawoma", document.id)).status,
			200,
		);
		await assert.rejects(() => assets.documents.get("unclet", document.id));
		assert.equal((await fetch(`${serviceUrl}/documents/${slug}`)).status, 404);
		await assets.documents.visibility("jublawoma", document.id, true);
		assert.equal((await fetch(`${serviceUrl}/documents/${slug}`)).status, 200);
	} finally {
		await assets.documents.delete("jublawoma", document.id);
	}
});

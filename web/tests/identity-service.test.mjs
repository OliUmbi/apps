import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createIdentityClient } = await jiti.import(
	"../packages/identity/src/index.ts",
);
const { configureEnvironment } = await jiti.import(
	"../packages/environment/src/vite.ts",
);
const serviceUrl = process.env.TEST_IDENTITY_URL;

test("identity client manages an account and session against the Java service", {
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
	const identity = createIdentityClient({
		baseUrl: () => serviceUrl,
		token: () => process.env.IDENTITY_INTERNAL_AUTHORIZATION_TOKEN,
	});
	const name = `test-${randomUUID()}`;
	const password = "LocalTestPassword1";
	const account = await identity.createAccount({
		name,
		email: `${name}@example.test`,
		password,
	});
	try {
		await identity.grantPermission(account.id, "unclet.manage");
		assert.deepEqual((await identity.getAccount(account.id)).permissions, [
			{ permission: "unclet.manage" },
		]);
		const session = await identity.createSession(name, password);
		assert.equal(
			(await identity.validateSession(session.token)).id,
			account.id,
		);
		await identity.revokeSession(session.token);
		await assert.rejects(() => identity.validateSession(session.token));
		await identity.revokePermission(account.id, "unclet.manage");
		assert.equal((await identity.getAccount(account.id)).permissions.length, 0);
	} finally {
		await identity.deleteAccount(account.id);
	}
});

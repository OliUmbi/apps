import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { connectionOptions, databasePoolSize } = await jiti.import(
	"../packages/database/src/connection.ts",
);
const { createIdentityClient } = await jiti.import(
	"../packages/identity/src/index.ts",
);
const { createQueueClient } = await jiti.import(
	"../packages/queue/src/index.ts",
);

test("connections reject a URL for a different database role", () => {
	assert.throws(
		() =>
			connectionOptions({
				role: "unclet",
				connectionString: () => "postgres://studio:secret@localhost/test",
			}),
		/must authenticate as unclet/,
	);
	assert.equal(
		connectionOptions({
			role: "unclet",
			connectionString: () => "postgres://localhost/test",
			password: () => "secret",
		}).username,
		"unclet",
	);
	assert.throws(() => databasePoolSize("10oops"));
});

test("identity uses bearer management authorization and validates the service response", async () => {
	let request;
	const client = createIdentityClient({
		baseUrl: () => "http://identity.test",
		token: () => "internal-test-token",
		fetch: async (url, init) => {
			request = { url, init };
			return Response.json({
				token: "session",
				expiresAt: "2026-09-11T00:00:00Z",
				actor: { id: "1c0d47d6-c40d-42f9-ab16-5efc394af43b", name: "operator" },
			});
		},
	});
	assert.equal(
		(await client.createSession("operator", "password")).actor.name,
		"operator",
	);
	assert.equal(request.url.pathname, "/session");
	assert.equal(
		request.init.headers.get("Authorization"),
		"Bearer internal-test-token",
	);
	assert.deepEqual(JSON.parse(request.init.body), {
		name: "operator",
		password: "password",
	});
	const invalid = createIdentityClient({
		baseUrl: () => "http://identity.test",
		token: () => "token",
		fetch: async () => Response.json({ actor: "wrong" }),
	});
	await assert.rejects(() => invalid.validateSession("session"));
});

test("queue enqueues exactly one prepared message using the caller transaction", async () => {
	const calls = [];
	const sql = async (strings, ...values) => {
		calls.push({ strings, values });
	};
	await createQueueClient(sql).enqueue({
		id: "request-id",
		site: "unclet",
		sender: "sender@example.test",
		recipient: "recipient@example.test",
		subject: "Hello",
		text: "Text",
		html: "<p>Text</p>",
	});
	assert.equal(calls.length, 1);
	assert.match(calls[0].strings.join(""), /INSERT INTO queue.message/);
	assert.equal(calls[0].values[0], "request-id");
	assert.equal(calls[0].values[1], "unclet");
});

const { passwordSchema } = await jiti.import(
	"../packages/identity/src/password.ts",
);
test("password validation matches the identity service's Unicode and bcrypt limits", () => {
	assert.equal(passwordSchema.safeParse("ValidPassword1").success, true);
	assert.equal(passwordSchema.safeParse("alllowercase1").success, false);
	assert.equal(passwordSchema.safeParse("NoDigitsHere").success, false);
	assert.equal(passwordSchema.safeParse(`Äa1${"ü".repeat(40)}`).success, false);
});

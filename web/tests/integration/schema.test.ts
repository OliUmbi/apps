import assert from "node:assert/strict";
import test, { after } from "node:test";
import { eq, type SQL, sql } from "drizzle-orm";
import { viewDaily } from "../../packages/analytics/src/schema";
import { createAnalytics } from "../../packages/analytics/src/server";
import { createDonationCommitmentRepository } from "../../packages/jublawoma-data/src/content/donation-commitment.repository";
import { createQueueClient } from "../../packages/queue/src";
import { emailMessage } from "../../packages/queue/src/email";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import { createProductReservationRepository } from "../../packages/zelglihof-data/src/content/product-reservation.repository";
import {
	adminDatabase,
	asRole,
	databaseEnabled,
	expectRejected,
	joinedDatabase,
	rolledBack,
	type SiteRole,
} from "../support/database";
import { id, queuedEmails } from "../support/fixtures";

/*
 * The migrated schema's own guarantees - CHECK domains, windows and the
 * producer-only queue grant - are SQL, so only a live database proves them.
 * Every rejection names its SQLSTATE and constraint: an unrelated NOT NULL,
 * cast or permission failure must not be able to make a case pass.
 */

const skip = !databaseEnabled;
const admin = databaseEnabled ? adminDatabase() : null;
after(async () => {
	await admin?.close();
});

interface SchemaCase {
	constraint: string;
	/** Each entry is a statement list run in a fresh rolled-back transaction. */
	accepted: SQL[][];
	rejected: SQL[][];
}

async function accepts(statements: SQL[]) {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		for (const statement of statements) await transaction.execute(statement);
	});
}

async function rejects(statements: SQL[], constraint: string) {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		for (const statement of statements.slice(0, -1))
			await transaction.execute(statement);
		const last = statements[statements.length - 1];
		assert.ok(last);
		await expectRejected(() => transaction.execute(last), {
			code: "23514",
			constraint,
		});
	});
}

async function check(cases: SchemaCase[]) {
	for (const schemaCase of cases) {
		for (const statements of schemaCase.accepted) await accepts(statements);
		for (const statements of schemaCase.rejected)
			await rejects(statements, schemaCase.constraint);
	}
}

const zelglihofInquiryRow = (status: string) => sql`
	INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
	VALUES (${id()}, ${status}, 'hofladen', 'Review', '+41 79 000 00 00', 'Review message', now(), now())`;

const uncletInquiryRow = (status: string) => sql`
	INSERT INTO unclet.inquiry (id, status, name, email, phone, created_at, updated_at)
	VALUES (${id()}, ${status}, 'Review', 'review@example.com', '+41 79 000 00 00', now(), now())`;

const reservationRow = (status: string) => sql`
	INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
	VALUES (${id()}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 1, ${status}, now(), now())`;

const subscriberRow = (status: string) => sql`
	INSERT INTO zelglihof.subscriber (id, email, status, requested_at, confirmation_token_hash, unsubscribe_token, created_at, updated_at)
	VALUES (${id()}, ${`review-${id()}@example.com`}, ${status}, now(), ${id()}, ${id()}, now(), now())`;

const campaignRow = (status: string) => sql`
	INSERT INTO zelglihof.campaign (id, subject, body, status, created_at, updated_at)
	VALUES (${id()}, 'Review subject', 'Review body', ${status}, now(), now())`;

test("status domains reject unknown states", { skip }, async () => {
	await check([
		{
			constraint: "inquiry_status_domain",
			accepted: [
				[zelglihofInquiryRow("new")],
				[zelglihofInquiryRow("completed")],
			],
			rejected: [[zelglihofInquiryRow("archived")]],
		},
		{
			constraint: "inquiry_status_domain",
			accepted: [[uncletInquiryRow("completed")]],
			rejected: [[uncletInquiryRow("in progress")]],
		},
		{
			constraint: "product_reservation_status_domain",
			accepted: [[reservationRow("cancelled")]],
			rejected: [[reservationRow("done")]],
		},
		{
			constraint: "subscriber_status_domain",
			accepted: [[subscriberRow("active")]],
			rejected: [[subscriberRow("confirmed")]],
		},
		{
			constraint: "campaign_status_domain",
			accepted: [[campaignRow("draft")]],
			rejected: [[campaignRow("sent")]],
		},
	]);
});

test("review stars stay on the five-star scale", { skip }, async () => {
	const reviewRow = (stars: number) => sql`
		INSERT INTO unclet.review (id, stars, name, description, visible, created_at, updated_at)
		VALUES (${id()}, ${stars}, 'Review', 'Review description', false, now(), now())`;
	await check([
		{
			constraint: "review_stars_range",
			accepted: [1, 2, 3, 4, 5].map((stars) => [reviewRow(stars)]),
			rejected: [0, 6, -1].map((stars) => [reviewRow(stars)]),
		},
	]);
});

test("quantities and steps stay positive", { skip }, async () => {
	const donationRow = (donationId: string) => sql`
		INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
		VALUES (${donationId}, 'Review title', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`;
	const itemRow = (donationId: string, quantity: string, step: string) => sql`
		INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
		VALUES (${id()}, ${donationId}, 'Review name', ${quantity}, ${step}, 'kg', now(), now())`;
	const commitmentRow = (
		itemQuantity: string,
		step: string,
		quantity: string,
	) => sql`
		INSERT INTO jublawoma.donation_commitment (id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
		VALUES (${id()}, 'Review donation', 'Review item', ${itemQuantity}, ${step}, 'kg', 'Review', '+41 79 000 00 00', ${quantity}, now(), now())`;

	// The same rolled-back ids are reused across cases; nothing commits.
	const donationId = id();
	const values = ["0", "-1", "0.0"];
	await check([
		{
			constraint: "donation_item_quantity_positive",
			accepted: [[donationRow(donationId), itemRow(donationId, "2.5", "0.1")]],
			rejected: values.map((value) => [
				donationRow(donationId),
				itemRow(donationId, value, "0.1"),
			]),
		},
		{
			constraint: "donation_item_step_positive",
			accepted: [[donationRow(donationId), itemRow(donationId, "2.5", "0.1")]],
			rejected: values.map((value) => [
				donationRow(donationId),
				itemRow(donationId, "2.5", value),
			]),
		},
		{
			constraint: "donation_commitment_quantity_positive",
			accepted: [[commitmentRow("2.5", "0.5", "0.5")]],
			rejected: values.map((value) => [commitmentRow("2.5", "0.5", value)]),
		},
		{
			constraint: "donation_commitment_item_quantity_positive",
			accepted: [[commitmentRow("2.5", "0.5", "0.5")]],
			rejected: values.map((value) => [commitmentRow(value, "0.5", "0.5")]),
		},
		{
			constraint: "donation_commitment_step_positive",
			accepted: [[commitmentRow("2.5", "0.5", "0.5")]],
			rejected: values.map((value) => [commitmentRow("2.5", value, "0.5")]),
		},
	]);
});

test("stock is never negative", { skip }, async () => {
	const productRow = (productId: string) => sql`
		INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, created_at, updated_at)
		VALUES (${productId}, 'Review', 'Review description', 'Review body', true, true, now(), now())`;
	const variantRow = (productId: string, quantity: number | null) => sql`
		INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
		VALUES (${id()}, ${productId}, 'Review variant', 'CHF 5', ${quantity}, now(), now())`;
	const stockRow = (quantity: number, variantQuantity: number | null) => sql`
		INSERT INTO zelglihof.product_reservation (id, product_name, variant_name, variant_quantity, variant_price, name, phone, quantity, status, created_at, updated_at)
		VALUES (${id()}, 'Review product', 'Review variant', ${variantQuantity}, 'CHF 5', 'Review', '+41 79 000 00 00', ${quantity}, 'new', now(), now())`;

	const productId = id();
	await check([
		{
			constraint: "product_variant_quantity_nonnegative",
			accepted: [null, 0, 5].map((quantity) => [
				productRow(productId),
				variantRow(productId, quantity),
			]),
			rejected: [[productRow(productId), variantRow(productId, -1)]],
		},
		{
			constraint: "product_reservation_quantity_positive",
			accepted: [[stockRow(1, null)]],
			rejected: [0, -1].map((quantity) => [stockRow(quantity, null)]),
		},
		{
			constraint: "product_reservation_variant_quantity_nonnegative",
			accepted: [null, 0, 5].map((quantity) => [stockRow(1, quantity)]),
			rejected: [[stockRow(1, -1)]],
		},
	]);
});

test("date ranges run forward", { skip }, async () => {
	await check([
		{
			constraint: "promotion_window",
			accepted: [
				[
					sql`INSERT INTO jublawoma.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', '/latest', now(), now() + interval '1 day', now(), now())`,
				],
				[
					sql`INSERT INTO zelglihof.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', '/latest', now(), now() + interval '1 day', now(), now())`,
				],
			],
			rejected: [
				[
					sql`INSERT INTO jublawoma.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', '/latest', now() + interval '1 day', now(), now(), now())`,
				],
				[
					sql`INSERT INTO zelglihof.promotion (id, title, description, link, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', '/latest', now() + interval '1 day', now(), now(), now())`,
				],
			],
		},
		{
			constraint: "donation_window",
			accepted: [
				[
					sql`INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`,
				],
			],
			rejected: [
				[
					sql`INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', 'Review contact', now() + interval '1 day', now(), now(), now())`,
				],
			],
		},
		{
			constraint: "event_period",
			accepted: [
				[
					sql`INSERT INTO jublawoma.event (id, name, location, starts_on, ends_on, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review location', DATE '2026-09-17', DATE '2026-09-17', now(), now())`,
				],
			],
			rejected: [
				[
					sql`INSERT INTO jublawoma.event (id, name, location, starts_on, ends_on, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review location', DATE '2026-09-18', DATE '2026-09-17', now(), now())`,
				],
			],
		},
		{
			constraint: "product_window",
			accepted: [
				[
					sql`INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', 'Review body', true, true, now(), null, now(), now())`,
				],
				[
					sql`INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', 'Review body', true, true, now(), now() + interval '1 day', now(), now())`,
				],
			],
			rejected: [
				[
					sql`INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, starts_at, ends_at, created_at, updated_at)
						VALUES (${id()}, 'Review', 'Review description', 'Review body', true, true, now() + interval '1 day', now(), now(), now())`,
				],
			],
		},
	]);
});

test("inquiry subjects stay in their vocabulary", { skip }, async () => {
	const subjectRow = (subject: string) => sql`
		INSERT INTO zelglihof.inquiry (id, status, subject, name, phone, message, created_at, updated_at)
		VALUES (${id()}, 'new', ${subject}, 'Review', '+41 79 000 00 00', 'Review message', now(), now())`;
	await check([
		{
			constraint: "inquiry_subject_domain",
			accepted: ["hofladen", "reservation", "hof", "other"].map((subject) => [
				subjectRow(subject),
			]),
			rejected: [[subjectRow("nonsense")]],
		},
	]);
});

test("orphaned commitments and reservations stay visible", {
	skip,
}, async () => {
	assert.ok(admin);
	const page = { page: 0, size: 30, search: "" };

	await rolledBack(admin, async (transaction) => {
		const donationId = id();
		const itemId = id();
		const commitmentId = id();
		await transaction.execute(sql`
			INSERT INTO jublawoma.donation (id, title, description, contact, starts_at, ends_at, created_at, updated_at)
			VALUES (${donationId}, 'Review donation', 'Review description', 'Review contact', now(), now() + interval '1 day', now(), now())`);
		await transaction.execute(sql`
			INSERT INTO jublawoma.donation_item (id, donation_id, name, quantity, step, unit, created_at, updated_at)
			VALUES (${itemId}, ${donationId}, 'Review item', 2.5, 0.5, 'kg', now(), now())`);
		await transaction.execute(sql`
			INSERT INTO jublawoma.donation_commitment (id, donation_id, donation_item_id, donation_title, item_name, item_quantity, step, unit, name, phone, quantity, created_at, updated_at)
			VALUES (${commitmentId}, ${donationId}, ${itemId}, 'Review donation', 'Review item', 2.5, 0.5, 'kg', 'Review', '+41 79 000 00 00', 0.5, now(), now())`);
		// The snapshot columns are the history: deleting the parent keeps the row.
		await transaction.execute(
			sql`DELETE FROM jublawoma.donation WHERE id = ${donationId}`,
		);

		const commitments = createDonationCommitmentRepository(transaction);
		const record = (await commitments.list(page)).items.find(
			(row) => row.id === commitmentId,
		);
		assert.ok(record);
		assert.equal(record.donationId, null);
		assert.equal(record.donationItemId, null);
		assert.equal(record.donationTitle, "Review donation");
		assert.equal(record.itemName, "Review item");
		assert.equal(record.quantity, "0.5");
		assert.equal(
			(await commitments.listForDonation(page, donationId)).items.length,
			0,
		);
	});

	await rolledBack(admin, async (transaction) => {
		const productId = id();
		const variantId = id();
		const reservationId = id();
		await transaction.execute(sql`
			INSERT INTO zelglihof.product (id, name, description, body, visible, reservable, created_at, updated_at)
			VALUES (${productId}, 'Review product', 'Review description', 'Review body', true, true, now(), now())`);
		await transaction.execute(sql`
			INSERT INTO zelglihof.product_variant (id, product_id, name, price, quantity, created_at, updated_at)
			VALUES (${variantId}, ${productId}, 'Review variant', 'CHF 5', 3, now(), now())`);
		await transaction.execute(sql`
			INSERT INTO zelglihof.product_reservation (id, product_id, product_variant_id, product_name, variant_name, variant_price, name, phone, quantity, status, created_at, updated_at)
			VALUES (${reservationId}, ${productId}, ${variantId}, 'Review product', 'Review variant', 'CHF 5', 'Review', '+41 79 000 00 00', 1, 'new', now(), now())`);
		await transaction.execute(
			sql`DELETE FROM zelglihof.product WHERE id = ${productId}`,
		);

		const reservations = createProductReservationRepository(transaction);
		const record = (await reservations.list(page)).items.find(
			(row) => row.id === reservationId,
		);
		assert.ok(record);
		assert.equal(record.productId, null);
		assert.equal(record.productVariantId, null);
		assert.equal(record.productName, "Review product");
		assert.equal(record.variantName, "Review variant");
		assert.equal(
			(await reservations.listForProduct(page, productId)).items.length,
			0,
		);
	});
});

const producerRoles: SiteRole[] = [
	"studio",
	"oliumbi",
	"jublawoma",
	"unclet",
	"zelglihof",
];

test("queue producers can enqueue but cannot read", { skip }, async () => {
	assert.ok(admin);
	const recipient = "recipient@example.com";

	for (const role of producerRoles) {
		await rolledBack(admin, async (transaction) => {
			await asRole(transaction, role, async () => {
				await createQueueClient(transaction).enqueue(
					emailMessage(
						role,
						"sender@example.com",
						recipient,
						"Review",
						"Review body",
					),
				);
			});
			assert.equal(await queuedEmails(transaction, recipient), 1);
		});
	}

	for (const role of producerRoles) {
		await rolledBack(admin, async (transaction) => {
			// No RESET: the failed select aborts the transaction, which rolls back.
			await transaction.execute(sql`SET LOCAL ROLE ${sql.raw(role)}`);
			await expectRejected(() => transaction.select().from(queuedMessage), {
				code: "42501",
			});
		});
	}
});

test("a site role can upsert its counter and Studio can read it", {
	skip,
}, async () => {
	assert.ok(admin);
	await rolledBack(admin, async (transaction) => {
		const analytics = createAnalytics(
			joinedDatabase(transaction),
			"jublawoma",
			["/about"],
		);
		// The second call is the ON CONFLICT path: PostgreSQL checks SELECT on the
		// conflict target and every column the DO UPDATE expression reads.
		await asRole(transaction, "jublawoma", async () => {
			await analytics.record("/about");
			await analytics.record("/about");
		});

		let views: number | undefined;
		await asRole(transaction, "studio", async () => {
			const [row] = await transaction
				.select({ views: viewDaily.views })
				.from(viewDaily)
				.where(eq(viewDaily.site, "jublawoma"));
			views = row?.views;
		});
		assert.equal(views, 2);
	});
});

test("duplicate queue ids fail closed", { skip }, async () => {
	assert.ok(admin);
	const message = emailMessage(
		"studio",
		"sender@example.com",
		"recipient@example.com",
		"Review",
		"Review body",
	);
	await rolledBack(admin, async (transaction) => {
		await transaction.execute(sql`SET LOCAL ROLE studio`);
		await createQueueClient(transaction).enqueue(message);
		await expectRejected(
			() => createQueueClient(transaction).enqueue(message),
			{
				code: "23505",
				constraint: "message_pkey",
			},
		);
	});
});

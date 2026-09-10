import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createDatabasePool } = await jiti.import(
	"../packages/database/src/index.ts",
);
const { createResourceRepository } = await jiti.import(
	"../packages/database/src/resource.repository.ts",
);
const { createReservationService } = await jiti.import(
	"../packages/zelglihof-data/src/reservation.service.ts",
);
const { createDonationService } = await jiti.import(
	"../packages/jublawoma-data/src/donation.service.ts",
);
const { createNewsletterService } = await jiti.import(
	"../packages/zelglihof-data/src/newsletter.service.ts",
);
const { createInquiryService: uncletInquiries } = await jiti.import(
	"../packages/unclet-data/src/inquiry.service.ts",
);
const { createInquiryService: zelglihofInquiries } = await jiti.import(
	"../packages/zelglihof-data/src/inquiry.service.ts",
);
const { createCampaignService } = await jiti.import(
	"../packages/zelglihof-data/src/campaign.service.ts",
);
const { createContentRepository } = await jiti.import(
	"../packages/unclet-data/src/content.repository.ts",
);
const catalogs = await Promise.all(
	["unclet", "zelglihof", "jublawoma"].map((site) =>
		jiti.import(`../packages/${site}-data/src/catalog.ts`),
	),
);
const { createDonationReader } = await jiti.import(
	"../packages/jublawoma-data/src/donation-reader.ts",
);
const url = process.env.TEST_DATABASE_URL;

test("schema compatibility, role grants, atomic notifications and concurrent stock limits", {
	skip: !url,
}, async () => {
	assert.match(
		new URL(url).pathname,
		/_test$/,
		"Integration tests require a dedicated _test database",
	);
	const admin = createDatabasePool({
		role: "postgres",
		applicationName: "web-rework-test",
		connectionString: () => url,
	});
	const rolePool = (role) => {
		const connection = new URL(url);
		connection.username = role;
		connection.password = `${role}_password`;
		return createDatabasePool({
			role,
			applicationName: "web-role-test",
			connectionString: () => connection.href,
		});
	};
	const uncle = rolePool("unclet"),
		farm = rolePool("zelglihof"),
		club = rolePool("jublawoma"),
		studio = rolePool("studio");
	try {
		for (const catalog of catalogs)
			for (const resource of Object.values(catalog.resources)) {
				const page = await createResourceRepository(studio.sql, resource).list({
					page: 0,
					size: 2,
					search: "",
				});
				assert.ok(Array.isArray(page.items), resource.table);
			}
		await assert.rejects(() => uncle.sql`SELECT * FROM zelglihof.product`);
		await assert.rejects(() => farm.sql`SELECT * FROM unclet.inquiry`);
		assert.equal(
			(await farm.sql`SELECT current_user`)[0].current_user,
			"zelglihof",
		);
		const email = `test-${randomUUID()}@example.test`;
		await uncletInquiries(uncle, "owner@example.test").submit({
			name: "Test Person",
			phone: "0791234567",
			email,
			date: "",
			location: "Test",
			guests: 4,
			note: "Test inquiry",
		});
		assert.equal(
			Number(
				(
					await admin.sql`SELECT count(*) FROM queue.message WHERE recipient=${email}`
				)[0].count,
			),
			1,
		);
		await zelglihofInquiries(farm, "farm@example.test").submit({
			name: "Test Person",
			phone: "0791234567",
			email,
			subject: "other",
			message: "Test farm message",
		});
		const productId = randomUUID(),
			variantId = randomUUID();
		await admin.sql`INSERT INTO zelglihof.product (id,name,description,body,visible,reservable,created_at,updated_at) VALUES (${productId},'Test product','Description','Body',true,true,now(),now())`;
		await admin.sql`INSERT INTO zelglihof.product_variant (id,product_id,name,price,quantity,created_at,updated_at) VALUES (${variantId},${productId},'Test variant','CHF 10',1,now(),now())`;
		const reservation = {
			productId,
			variantId,
			name: "Test Person",
			phone: "0791234567",
			email,
			quantity: 1,
			note: "",
		};
		const service = createReservationService(farm, "farm@example.test");
		const results = await Promise.all([
			service.reserve(reservation),
			service.reserve(reservation),
		]);
		assert.equal(
			results.filter((result) => result.outcome === "reserved").length,
			1,
		);
		assert.equal(
			(
				await admin.sql`SELECT quantity FROM zelglihof.product_variant WHERE id=${variantId}`
			)[0].quantity,
			0,
		);
		const [snapshot] =
			await admin.sql`SELECT product_name,variant_price FROM zelglihof.product_reservation WHERE product_id=${productId}`;
		assert.deepEqual(
			{ ...snapshot },
			{ product_name: "Test product", variant_price: "CHF 10" },
		);
		const donationId = randomUUID(),
			itemId = randomUUID();
		await admin.sql`INSERT INTO jublawoma.donation (id,title,description,contact,starts_at,ends_at,created_at,updated_at) VALUES (${donationId},'Test camp','Camp','Team',now()-interval '1 day',now()+interval '1 day',now(),now())`;
		await admin.sql`INSERT INTO jublawoma.donation_item (id,donation_id,name,description,quantity,step,unit,created_at,updated_at) VALUES (${itemId},${donationId},'Rice','Food',2,0.5,'kg',now(),now())`;
		const donations = createDonationService(club);
		assert.equal(
			(
				await donations.commit({
					donationId,
					itemId,
					name: "Test Person",
					phone: "0791234567",
					quantity: 0.3,
					note: "",
				})
			).outcome,
			"unavailable",
		);
		const commitments = await Promise.all(
			[1.5, 1.5].map((quantity) =>
				donations.commit({
					donationId,
					itemId,
					name: "Test Person",
					phone: "0791234567",
					quantity,
					note: "",
				}),
			),
		);
		assert.equal(
			commitments.filter((result) => result.outcome === "committed").length,
			1,
		);
		assert.equal(
			(await createDonationReader(club.sql).items(donationId))[0].remaining,
			0.5,
		);
		const newsletter = createNewsletterService(farm, {
			publicUrl: "https://farm.example.test",
			sender: "farm@example.test",
		});
		const subscriberEmail = `newsletter-${randomUUID()}@example.test`;
		await newsletter.request(subscriberEmail);
		const [confirmation] =
			await admin.sql`SELECT text FROM queue.message WHERE recipient=${subscriberEmail}`;
		const token = confirmation.text.match(/\/newsletter\/confirm\/([\w-]+)/)[1];
		assert.equal((await newsletter.confirm(token)).outcome, "confirmed");
		assert.equal(
			(await newsletter.confirm(token)).outcome,
			"already-confirmed",
		);
		const [subscriber] =
			await admin.sql`SELECT unsubscribe_token FROM zelglihof.subscriber WHERE email=${subscriberEmail}`;
		await newsletter.unsubscribe(subscriber.unsubscribe_token);
		assert.equal((await newsletter.confirm(token)).outcome, "invalid");

		const showcaseDefinition = catalogs[0].resources["unclet.showcase"];
		const showcases = createResourceRepository(uncle.sql, showcaseDefinition);
		const showcase = await showcases.create({
			slug: `test-${randomUUID()}`,
			title: "Private draft",
			location: "Test location",
			guest_count: 12,
			image_id: null,
			published: false,
			published_on: null,
			body: "Draft body",
		});
		const publicContent = createContentRepository(uncle.sql);
		assert.equal(
			await publicContent.detail("unclet.showcase", showcase.slug, true),
			null,
		);
		await showcases.update(
			{ id: showcase.id },
			{ published: true, published_on: "2020-01-01" },
		);
		assert.equal(
			(await publicContent.detail("unclet.showcase", showcase.slug, true))
				.record.title,
			"Private draft",
		);
		await showcases.delete({ id: showcase.id });
		assert.equal(await showcases.find({ id: showcase.id }), null);

		const activeEmail = `campaign-${randomUUID()}@example.test`;
		await newsletter.request(activeEmail);
		await newsletter.request(activeEmail);
		const confirmations =
			await admin.sql`SELECT text FROM queue.message WHERE recipient=${activeEmail}`;
		assert.equal(
			confirmations.length,
			1,
			"Resend cooldown must prevent duplicate confirmation messages",
		);
		const activeToken = confirmations[0].text.match(
			/\/newsletter\/confirm\/([\w-]+)/,
		)[1];
		await newsletter.confirm(activeToken);
		const campaignId = randomUUID();
		await admin.sql`INSERT INTO zelglihof.campaign (id,subject,body,status,created_at,updated_at) VALUES (${campaignId},${campaignId},'Campaign body','draft',now(),now())`;
		const campaigns = createCampaignService(farm, {
			publicUrl: "https://farm.example.test",
			sender: "farm@example.test",
		});
		const sends = await Promise.allSettled([
			campaigns.send(campaignId),
			campaigns.send(campaignId),
		]);
		assert.equal(
			sends.filter((result) => result.status === "fulfilled").length,
			1,
			"Concurrent sends must queue a campaign only once",
		);
		const queued =
			await admin.sql`SELECT recipient,text FROM queue.message WHERE subject=${campaignId}`;
		assert.equal(
			queued.filter((message) => message.recipient === activeEmail).length,
			1,
		);
		assert.equal(
			queued.filter((message) => message.recipient === subscriberEmail).length,
			0,
			"Unsubscribed recipients must be excluded",
		);
		assert.ok(
			queued.every((message) =>
				message.text.includes("/newsletter/unsubscribe/"),
			),
		);
	} finally {
		await Promise.all(
			[admin, uncle, farm, club, studio].map((pool) => pool.close()),
		);
	}
});

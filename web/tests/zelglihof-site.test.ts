import assert from "node:assert/strict";
import test from "node:test";
import { reservationSchema } from "../packages/zelglihof-data/src/forms";
import { formatArticleDate } from "../sites/zelglihof/src/model/dates";
import { absoluteUrl, siteOrigin } from "../sites/zelglihof/src/model/links";

const id = "11111111-1111-4111-8111-111111111111";
const reservation = {
	submissionId: id,
	productId: id,
	variantId: id,
	name: "Anna Meier",
	email: "",
	phone: "079 123 45 67",
	quantity: 1,
	note: "",
};

test("article dates render in the pinned de-CH locale with the midday anchor", () => {
	assert.equal(formatArticleDate("2025-06-01"), "1. Juni 2025");
	// Year and month edges stay on their calendar day.
	assert.equal(formatArticleDate("2024-12-31"), "31. Dezember 2024");
	assert.equal(formatArticleDate("2025-03-01"), "1. März 2025");
});

test("social preview images are absolute canonical URLs", () => {
	assert.equal(siteOrigin, "https://zelglihof-maegenwil.ch");
	assert.equal(
		absoluteUrl("/api/assets/abc?size=xl"),
		"https://zelglihof-maegenwil.ch/api/assets/abc?size=xl",
	);
});

test("the reservation schema keeps its idempotency key and quantity backstop", () => {
	assert.equal(reservationSchema.safeParse(reservation).success, true);
	// The input `max` is a hint; the schema cap stays as backstop.
	assert.equal(
		reservationSchema.safeParse({ ...reservation, quantity: 101 }).success,
		false,
	);
	assert.equal(
		reservationSchema.safeParse({ ...reservation, quantity: 0 }).success,
		false,
	);
	assert.equal(
		reservationSchema.safeParse({ ...reservation, submissionId: undefined })
			.success,
		false,
	);
});

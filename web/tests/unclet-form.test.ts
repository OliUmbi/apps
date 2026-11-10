import assert from "node:assert/strict";
import test from "node:test";
import { submissionErrors } from "../packages/ui/src/submission-types";
import {
	type InquirySubmissionInput,
	inquirySchema,
	todayDateInput,
} from "../packages/unclet-data/src/forms";
import { inquiryEmails } from "../packages/unclet-data/src/inquiry.email";
import { showcaseExcerpt } from "../packages/unclet-data/src/public.repository";
import { formatMonthYear } from "../sites/unclet/src/model/dates";
import {
	absoluteUrl,
	pageHead,
	siteOrigin,
} from "../sites/unclet/src/model/metadata";

const id = "11111111-1111-4111-8111-111111111111";

function dayOffset(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() + days);
	const pad = (part: number) => String(part).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function inquiryWith(date: string): InquirySubmissionInput {
	return {
		submissionId: id,
		name: "Anna Meier",
		email: "a@b.ch",
		phone: "079 123 45 67",
		date,
		location: "",
		guests: 12,
		note: "",
	};
}

test("an event date is empty or has not passed yet (U-10)", () => {
	assert.equal(inquirySchema.safeParse(inquiryWith("")).success, true);
	assert.equal(
		inquirySchema.safeParse(inquiryWith(dayOffset(30))).success,
		true,
	);
	const past = inquiryWith(dayOffset(-1));
	const rejected = inquirySchema.safeParse(past);
	assert.equal(rejected.success, false);
	// The refine failure stays attributed to the date field.
	assert.equal(
		submissionErrors<InquirySubmissionInput>(
			rejected.success ? [] : rejected.error.issues,
			past as unknown as Record<string, unknown>,
		).fields.date,
		"custom",
	);
});

test("today is the first accepted event date, in local calendar parts", () => {
	const today = todayDateInput();
	assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
	// The schema boundary has teeth: today passes, yesterday does not.
	assert.equal(inquirySchema.safeParse(inquiryWith(today)).success, true);
	assert.equal(
		inquirySchema.safeParse(inquiryWith(dayOffset(-1))).success,
		false,
	);
});

test("the list teaser is plain text, markup-free and bounded (U-07)", () => {
	const excerpt = showcaseExcerpt(
		"## Ein Abend\n\n**Feines** aus dem *Ofen* mit [mehr Infos](https://example.com).\n\n- Punkt eins\n> zitiert\n\n```js\nconst code = 1;\n```\n" +
			"langer Text ".repeat(80),
	);
	assert.doesNotMatch(excerpt, /[*_#>`[\]]/);
	assert.doesNotMatch(excerpt, /https?:\/\//);
	assert.doesNotMatch(excerpt, /const code/);
	assert.ok([...excerpt].length <= 241);
	assert.ok(excerpt.endsWith("…"));
	assert.equal(showcaseExcerpt("**kurz**"), "kurz");
});

test("inquiry emails carry the submitted details and the stable reference (U-02)", () => {
	const input = inquiryWith("2027-05-20");
	const [notification, confirmation] = inquiryEmails(
		"info@uncle-t.ch",
		input,
		"A1B2C3D4E5F6",
	);
	for (const expected of [
		"Anna Meier",
		"a@b.ch",
		"079 123 45 67",
		"2027-05-20",
		"12",
		"A1B2C3D4E5F6",
	]) {
		assert.ok(
			notification.text.includes(expected),
			`the notification body lacks ${expected}`,
		);
	}
	assert.equal(notification.recipient, "info@uncle-t.ch");
	assert.equal(confirmation.recipient, input.email);
	assert.match(confirmation.text, /A1B2C3D4E5F6/);
});

test("calendar months render from their parts in the site locale (U-14)", () => {
	assert.equal(formatMonthYear("2026-10-15", "de-CH"), "Oktober 2026");
	// A day near a month edge never shifts when the parts are read directly.
	assert.equal(formatMonthYear("2026-12-31", "de-CH"), "Dezember 2026");
	assert.equal(formatMonthYear("gestern", "de-CH"), "");
});

test("social preview images resolve against the canonical origin (X-06)", () => {
	assert.equal(siteOrigin, "https://uncle-t.ch");
	assert.equal(
		absoluteUrl("/api/assets/0000"),
		"https://uncle-t.ch/api/assets/0000",
	);
	const head = pageHead({
		title: "Einblick · Uncle-T",
		description: "Ein Abend",
		image: "/api/assets/1111",
	});
	assert.deepEqual(head.meta, [
		{ title: "Einblick · Uncle-T" },
		{ property: "og:title", content: "Einblick · Uncle-T" },
		{ name: "description", content: "Ein Abend" },
		{ property: "og:description", content: "Ein Abend" },
		{ property: "og:image", content: "https://uncle-t.ch/api/assets/1111" },
	]);
	assert.deepEqual(pageHead({ title: "Nur Titel" }).meta, [
		{ title: "Nur Titel" },
		{ property: "og:title", content: "Nur Titel" },
	]);
});

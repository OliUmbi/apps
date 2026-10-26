import assert from "node:assert/strict";
import test from "node:test";
import {
	formatDate,
	formatDonationDates,
	formatEventDates,
} from "../sites/jublawoma/src/model/dates";
import {
	absoluteUrl,
	contactMailto,
	instagramUrl,
	registrationFormPdf,
	siteOrigin,
} from "../sites/jublawoma/src/model/links";

test("dates render in the pinned de-CH locale with the midday anchor", () => {
	assert.equal(formatDate("2024-05-01"), "1.5.2024");
	// The anchor keeps a calendar day stable even at month and year edges.
	assert.equal(formatDate("2024-12-31"), "31.12.2024");
	assert.equal(formatEventDates("2024-05-01"), "01. Mai 2024");
});

test("event ranges collapse equal dates and keep distinct ones", () => {
	assert.equal(
		formatEventDates("2024-05-01", "2024-05-01"),
		formatEventDates("2024-05-01"),
	);
	assert.equal(
		formatEventDates("2024-05-01", "2024-05-03"),
		"01. Mai 2024 – 03. Mai 2024",
	);
});

test("same-day donation ranges print the day once (J-17)", () => {
	assert.equal(
		formatDonationDates("2026-10-25T09:00:00Z", "2026-10-25T22:00:00Z"),
		"25. Oktober 2026",
	);
	assert.equal(
		formatDonationDates("2026-10-25T09:00:00Z", "2026-10-26T22:00:00Z"),
		"25. Oktober 2026 – 26. Oktober 2026",
	);
});

test("unparseable donation dates render as nothing instead of Invalid Date", () => {
	assert.equal(formatDonationDates("soon", "2026-10-25T09:00:00Z"), "");
	assert.equal(formatDonationDates("2026-10-25T09:00:00Z", "later"), "");
});

test("site links resolve from one module and absolute URLs from one origin", () => {
	assert.equal(
		registrationFormPdf,
		"/assets/documents/Anmeldung-Jubla-Woma.pdf",
	);
	assert.equal(contactMailto, "mailto:scharleitung@jublawoma.ch");
	assert.equal(instagramUrl, "https://www.instagram.com/jubla_woma/");
	assert.equal(siteOrigin, "https://jublawoma.ch");
	assert.equal(
		absoluteUrl("/api/assets/0000?size=xl"),
		"https://jublawoma.ch/api/assets/0000?size=xl",
	);
});

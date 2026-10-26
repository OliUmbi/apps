import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import { QueryProvider } from "../packages/query/src/provider";
import { inquirySchema } from "../packages/unclet-data/src/forms";
import { ReviewCard } from "../sites/unclet/src/components/review-card";
import { SubmissionForm } from "../sites/unclet/src/components/submission-form";

// The site's dependencies resolve from its own node_modules; a test lives in
// web/tests and must ask for React from the site's package location.
const fromSite = createRequire(resolve("sites/unclet/package.json"));
const { renderToStaticMarkup } = fromSite("react-dom/server") as {
	renderToStaticMarkup: (element: unknown) => string;
};
const { createElement } = fromSite("react") as {
	createElement: (
		type: unknown,
		props: unknown,
		...children: unknown[]
	) => unknown;
};

function renderForm() {
	const form = createElement(SubmissionForm, {
		schema: inquirySchema,
		submit: async () => ({ outcome: "accepted", reference: "TEST-1" }),
		submitLabel: "Anlass anfragen",
		fields: [
			{ name: "name", label: "Name", kind: "text", required: true },
			{ name: "date", label: "Datum", kind: "date" },
			{
				name: "guests",
				label: "Gäste",
				kind: "number",
				min: 1,
				required: true,
			},
			{
				name: "note",
				label: "Deine Idee",
				kind: "textarea",
				rows: 5,
				wide: true,
			},
		],
	});
	return renderToStaticMarkup(createElement(QueryProvider, null, form));
}

test("the inquiry form renders typed fields with their layout hooks", () => {
	const html = renderForm();
	assert.match(html, /class="form-control-wrap"/);
	assert.match(html, /class="form-control-wrap is-wide"/);
	assert.match(html, /<label[^>]*>Name<\/label>/);
	assert.match(html, /<textarea rows="5"[^>]*name="note"/);
	assert.match(
		html,
		/type="number"[^>]*name="guests"|name="guests"[^>]*type="number"/,
	);
});

test("the date input carries today's min boundary (U-10)", () => {
	const today = new Date();
	const pad = (part: number) => String(part).padStart(2, "0");
	const min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
	assert.match(renderForm(), new RegExp(`type="date"[^>]*min="${min}"`));
});

test("the form reserves one feedback slot and one submit control", () => {
	const html = renderForm();
	assert.match(html, /role="alert" aria-live="assertive"/);
	assert.match(html, /type="submit"[^>]*>Anlass anfragen</);
});

test("a review card always shows five star slots (U-19)", () => {
	const html = renderToStaticMarkup(
		createElement(ReviewCard, {
			review: {
				id: "r1",
				name: "Anna Meier",
				description: "Ein unvergesslicher Abend.",
				stars: 3,
			},
		}),
	);
	assert.match(html, /3 von 5 Sternen/);
	// Three filled and two outline stars: the rating never reads ambiguously.
	assert.equal(html.match(/fill="currentColor"/g)?.length, 3);
	assert.equal(html.match(/width="16"/g)?.length, 5);
});

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import { commitmentSchema } from "../packages/jublawoma-data/src/forms";
import { QueryProvider } from "../packages/query/src/provider";
import { SubmissionForm } from "../sites/jublawoma/src/components/submission-form";

// The site's dependencies resolve from its own node_modules; a test lives in
// web/tests and must ask for React from the site's package location.
const fromSite = createRequire(resolve("sites/jublawoma/package.json"));
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
		schema: commitmentSchema,
		submit: async () => ({ outcome: "committed", reference: "TEST-1" }),
		defaults: { donationId: "d", itemId: "i" },
		submitLabel: "Zusage senden",
		fields: [
			{ name: "name", label: "Name", kind: "text", required: true },
			{ name: "phone", label: "Telefon", kind: "tel", required: true },
			{
				name: "quantity",
				label: "Menge (kg)",
				kind: "decimal-string",
				min: 0.5,
				max: 10,
				step: 0.5,
				required: true,
			},
			{ name: "note", label: "Notiz", kind: "textarea", rows: 2 },
		],
	});
	return renderToStaticMarkup(createElement(QueryProvider, null, form));
}

test("the commitment form renders typed fields with their layout hooks", () => {
	const html = renderForm();
	assert.match(html, /class="form-control-wrap/);
	assert.match(html, /<label[^>]*>Name<\/label>/);
	assert.match(html, /<label[^>]*>Menge \(kg\)<\/label>/);
	// A decimal-string quantity keeps a numeric control with its bounds (D2).
	assert.match(html, /type="number" min="0.5" max="10" step="0.5"/);
	assert.match(html, /name="quantity"/);
	assert.match(html, /<textarea rows="2"[^>]*name="note"/);
	assert.match(html, /type="tel"[^>]*name="phone"|name="phone"/);
});

test("the form reserves one feedback slot and one submit control", () => {
	const html = renderForm();
	assert.match(html, /role="alert" aria-live="assertive"/);
	assert.match(html, /type="submit"[^>]*>Zusage senden</);
});

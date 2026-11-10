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

/** The rendered tag of one control, independent of attribute order. */
function controlTag(html: string, tag: "input" | "textarea", name: string) {
	const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "g")) ?? [];
	const match = tags.find((candidate) =>
		new RegExp(`\\bname="${name}"`).test(candidate),
	);
	assert.ok(match, `no <${tag}> named ${name} rendered`);
	return match;
}

function attribute(tag: string, name: string) {
	const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
	assert.ok(match, `${name} is missing from ${tag}`);
	return match[1];
}

test("the commitment form renders typed fields with their layout hooks", () => {
	const html = renderForm();
	assert.match(html, /class="form-control-wrap/);
	assert.match(html, /<label[^>]*>Name<\/label>/);
	assert.match(html, /<label[^>]*>Menge \(kg\)<\/label>/);

	// A decimal-string quantity keeps a numeric control with its bounds (D2).
	const quantity = controlTag(html, "input", "quantity");
	assert.equal(attribute(quantity, "type"), "number");
	assert.equal(attribute(quantity, "min"), "0.5");
	assert.equal(attribute(quantity, "max"), "10");
	assert.equal(attribute(quantity, "step"), "0.5");

	const phone = controlTag(html, "input", "phone");
	assert.equal(attribute(phone, "type"), "tel");
	assert.equal(attribute(phone, "name"), "phone");

	const note = controlTag(html, "textarea", "note");
	assert.equal(attribute(note, "rows"), "2");
});

test("the form renders the hidden honeypot a bot must not notice", () => {
	const honeypot = controlTag(renderForm(), "input", "website");
	assert.equal(attribute(honeypot, "type"), "text");
	assert.equal(attribute(honeypot, "aria-hidden"), "true");
	// React renders the tabIndex prop as the HTML attribute `tabindex`.
	assert.equal(attribute(honeypot, "tabindex"), "-1");
	assert.equal(attribute(honeypot, "class"), "sr-only");
});

test("the form reserves one feedback slot and one submit control", () => {
	const html = renderForm();
	const count = (pattern: RegExp) => html.match(pattern)?.length ?? 0;
	assert.equal(count(/role="alert"/g), 1);
	assert.equal(count(/type="submit"/g), 1);
	assert.match(html, /type="submit"[^>]*>Zusage senden</);
});

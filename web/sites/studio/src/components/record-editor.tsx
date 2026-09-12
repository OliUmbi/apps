import {
	type ResourceField as FieldDefinition,
	type ResourceRecord,
	resourceSchema,
} from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useState } from "react";
import { isEditorialResource } from "../studio/hierarchy";
import { getResource, type ResourceId } from "../studio/resources";
import { ResourceField } from "./resource-field";
import { Button, Form, FormFeedback } from "./ui/index";

export function RecordEditor({
	resourceId,
	record,
	onSave,
	onClose,
	pending,
	error,
	fixedValues = {},
	variant = "page",
}: {
	resourceId: ResourceId;
	record: ResourceRecord | null;
	onSave: (values: ResourceRecord) => void;
	onClose: () => void;
	pending: boolean;
	error: boolean;
	fixedValues?: ResourceRecord;
	variant?: "page" | "inline";
}) {
	const resource = getResource(resourceId);
	const fields = resource.fields.filter((field) => !field.readOnly);
	const [values, setValues] = useState<ResourceRecord>(() => ({
		...Object.fromEntries(
			fields.map((field) => [
				field.name,
				record?.[field.name] ?? fixedValues[field.name] ?? emptyValue(field),
			]),
		),
		...fixedValues,
	}));
	const [automaticSlug, setAutomaticSlug] = useState(!record);
	const [validation, setValidation] = useState("");
	const editorial = isEditorialResource(resourceId);

	const change = (field: FieldDefinition, value: ResourceRecord[string]) => {
		setValues((previous) => {
			const next = { ...previous, [field.name]: value };
			if (
				automaticSlug &&
				(field.name === "title" || field.name === "name") &&
				fields.some((candidate) => candidate.name === "slug")
			)
				next.slug = slugify(String(value ?? ""));
			return next;
		});
		if (field.name === "slug") setAutomaticSlug(false);
	};

	return (
		<section
			className={`editor-surface ${variant === "inline" ? "is-inline" : ""} ${editorial ? "is-editorial" : ""}`}
		>
			<header className="editor-heading">
				<div>
					<p className="page-kicker">{resource.label}</p>
					<h2>{record ? m.edit() : m.create()}</h2>
				</div>
				<span className="editor-index" aria-hidden="true">
					{editorial ? "WRITE / 01" : "ENTRY / 01"}
				</span>
			</header>
			<Form
				className="editor-form"
				onSubmit={(event) => {
					event.preventDefault();
					const result = resourceSchema(resource).safeParse(values);
					if (!result.success) {
						setValidation(
							result.error.issues
								.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
								.join(" · "),
						);
						return;
					}
					setValidation("");
					onSave(result.data as ResourceRecord);
				}}
			>
				<div className="editor-fields">
					{fields
						.filter((field) => !(field.name in fixedValues))
						.map((field) => (
							<ResourceField
								key={field.name}
								resourceId={resourceId}
								field={field}
								value={values[field.name]}
								onChange={(value) => change(field, value)}
							/>
						))}
				</div>
				<FormFeedback
					error={validation || (error ? m.error_generic() : null)}
				/>
				<footer className="editor-actions">
					<Button onClick={onClose} disabled={pending} className="button">
						{m.cancel()}
					</Button>
					<Button type="submit" disabled={pending} className="button primary">
						{pending ? m.saving() : m.save()}
					</Button>
				</footer>
			</Form>
		</section>
	);
}

function emptyValue(field: FieldDefinition) {
	if (field.kind === "checkbox") return false;
	if (field.nullable) return null;
	if (field.kind === "number") return field.min ?? 0;
	if (field.kind === "status") return "new";
	return "";
}

function slugify(value: string): string {
	return value
		.replace(/ä/gi, "ae")
		.replace(/ö/gi, "oe")
		.replace(/ü/gi, "ue")
		.replace(/ß/g, "ss")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 120);
}

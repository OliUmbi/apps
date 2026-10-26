import { Field } from "@base-ui/react/field";
import type {
	SubmissionErrorReason,
	SubmissionField,
	SubmissionFieldKind,
} from "@oliumbi/ui/submission-types";
import { validationMessage } from "@oliumbi/ui/use-submission-form";

export function SubmissionControl<Input>({
	field,
	error,
	disabled,
}: {
	field: SubmissionField<Input>;
	error?: SubmissionErrorReason;
	disabled: boolean;
}) {
	const numeric =
		field.kind === "number" || field.kind === "decimal-string" ? field : null;
	const textarea = field.kind === "textarea" ? field : null;
	return (
		<Field.Root
			name={field.name}
			className={`form-control-wrap ${field.wide ? "is-wide" : ""} grid gap-2 text-sm`}
		>
			<Field.Label className="font-medium">{field.label}</Field.Label>
			<Field.Control
				disabled={disabled}
				required={field.required}
				placeholder={field.placeholder}
				autoComplete={field.autoComplete}
				aria-invalid={error ? true : undefined}
				type={textarea ? undefined : inputType(field.kind)}
				render={textarea ? <textarea rows={textarea.rows ?? 5} /> : undefined}
				min={numeric?.min}
				max={numeric?.max}
				step={numeric?.step}
				defaultValue={numeric ? (numeric.min ?? 1) : undefined}
				className="w-full rounded-lg border border-bark/20 bg-oat px-3 py-2 focus:outline-2 focus:outline-offset-2 disabled:opacity-50"
			/>
			<Field.Error match={error !== undefined} className="text-danger">
				{error ? validationMessage(error) : null}
			</Field.Error>
		</Field.Root>
	);
}

function inputType(
	kind: SubmissionFieldKind,
): "text" | "email" | "tel" | "url" | "date" | "time" | "number" {
	switch (kind) {
		case "email":
		case "tel":
		case "url":
		case "date":
		case "time":
		case "number":
			return kind;
		case "decimal-string":
			// Numeric control, decimal-string payload: float64 must never touch a
			// quantity (D2).
			return "number";
		default:
			return "text";
	}
}

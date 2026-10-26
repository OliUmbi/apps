import { Field } from "@base-ui/react/field";
import { Select } from "@base-ui/react/select";
import { m } from "@oliumbi/i18n/messages";
import type {
	SubmissionErrorReason,
	SubmissionField,
	SubmissionFieldKind,
} from "@oliumbi/ui/submission-types";
import { validationMessage } from "@oliumbi/ui/use-submission-form";
import { todayDateInput } from "@oliumbi/unclet-data/forms";
import { ChevronDown } from "lucide-react";
import { InputField } from "./input-field";
import { RatingControl } from "./rating-control";

export function SubmissionControl<Input>({
	field,
	error,
	disabled,
}: {
	field: SubmissionField<Input>;
	error?: SubmissionErrorReason;
	disabled: boolean;
}) {
	const label = field.required
		? field.label
		: `${field.label} (${m.optional()})`;
	const numeric =
		field.kind === "number" || field.kind === "decimal-string" ? field : null;
	const textarea = field.kind === "textarea" ? field : null;
	if (field.kind === "rating")
		return (
			<RatingControl
				field={field}
				label={label}
				error={error}
				disabled={disabled}
			/>
		);
	if (field.kind === "select")
		return (
			<Field.Root name={field.name} className="grid gap-2">
				<Field.Label>{label}</Field.Label>
				<Select.Root
					disabled={disabled}
					name={field.name}
					items={field.options}
					defaultValue={field.options[0]?.value}
					required={field.required}
				>
					<Select.Trigger className="flex min-h-12 items-center justify-between border border-bone/20 bg-coal px-4 text-left">
						<Select.Value />
						<ChevronDown size={17} aria-hidden="true" />
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner className="z-70">
							<Select.Popup className="rounded-xl border border-current/20 bg-stone-100 p-2 text-stone-900 shadow-xl">
								{field.options.map((option) => (
									<Select.Item
										key={option.value}
										value={option.value}
										className="rounded p-3 data-highlighted:bg-stone-200"
									>
										<Select.ItemText>{option.label}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
				<Field.Error match={error !== undefined} className="text-danger">
					{error ? validationMessage(error) : null}
				</Field.Error>
			</Field.Root>
		);
	return (
		<InputField
			disabled={disabled}
			name={field.name}
			label={label}
			error={error}
			type={textarea ? undefined : inputType(field.kind)}
			render={textarea ? <textarea rows={textarea.rows ?? 5} /> : undefined}
			required={field.required}
			min={
				numeric?.min ?? (field.kind === "date" ? todayDateInput() : undefined)
			}
			max={numeric?.max}
			step={numeric?.step}
			placeholder={field.placeholder}
			autoComplete={field.autoComplete}
			defaultValue={numeric ? (numeric.min ?? 1) : undefined}
		/>
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

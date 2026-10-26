import { Field } from "@base-ui/react/field";
import { Select } from "@base-ui/react/select";
import type {
	SubmissionErrorReason,
	SubmissionFieldName,
} from "@oliumbi/ui/submission-types";
import { validationMessage } from "@oliumbi/ui/use-submission-form";
import { ChevronDown } from "lucide-react";
import { InputField } from "./input-field";

/*
 * Field descriptors typed against the form's schema input (a renamed domain
 * field is a compile error) and drawn only in the kinds this renderer
 * implements - a wider kind must render here first. The site-local additions
 * are the change notification a select needs when it drives other fields, and
 * the hint line shown in the reserved message slot when no error is present.
 */
type SiteFieldBase<Input> = {
	name: SubmissionFieldName<Input>;
	label: string;
	required?: boolean;
	placeholder?: string;
	autoComplete?: string;
	// Layout hook for the form grid (`form-control-wrap` / `is-wide` in CSS).
	wide?: boolean;
	onChange?: (value: string) => void;
	hint?: string;
};

export type SiteField<Input> = SiteFieldBase<Input> &
	(
		| { kind: "text" | "email" | "tel" }
		| { kind: "number"; min?: number; max?: number; step?: number }
		| { kind: "textarea"; rows?: number }
		| { kind: "select"; options: readonly { value: string; label: string }[] }
	);

export function SubmissionControl<Input>({
	field,
	disabled,
	error,
}: {
	field: SiteField<Input>;
	disabled: boolean;
	error?: SubmissionErrorReason;
}) {
	const invalid = error !== undefined;
	const message = invalid ? validationMessage(error) : (field.hint ?? null);
	const messageId = `${field.name}-message`;
	const messageLine = (
		<p
			id={messageId}
			className={`min-h-5 text-sm ${invalid ? "text-danger" : "text-ink/60"}`}
		>
			{message}
		</p>
	);
	if (field.kind === "select")
		return (
			<Field.Root name={field.name} className="grid gap-2 text-sm">
				<Field.Label className="font-medium">{field.label}</Field.Label>
				<Select.Root
					disabled={disabled}
					name={field.name}
					items={field.options}
					defaultValue={field.options[0]?.value}
					required={field.required}
					onValueChange={(value) => field.onChange?.(String(value))}
				>
					<Select.Trigger
						aria-invalid={invalid ? true : undefined}
						aria-describedby={messageId}
						className="flex min-h-12 items-center justify-between rounded-xl border border-forest/20 bg-cream px-4 text-left"
					>
						<Select.Value />
						<ChevronDown size={17} aria-hidden="true" />
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner className="z-70">
							<Select.Popup className="rounded-xl border border-current/20 bg-cream p-2 text-ink shadow-xl">
								{field.options.map((option) => (
									<Select.Item
										key={option.value}
										value={option.value}
										className="rounded p-3 data-highlighted:bg-oat"
									>
										<Select.ItemText>{option.label}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
				{messageLine}
			</Field.Root>
		);
	return (
		<InputField
			disabled={disabled}
			name={field.name}
			label={field.label}
			type={field.kind === "textarea" ? undefined : field.kind}
			render={
				field.kind === "textarea" ? (
					<textarea rows={field.rows ?? 5} />
				) : undefined
			}
			required={field.required}
			min={field.kind === "number" ? field.min : undefined}
			max={field.kind === "number" ? field.max : undefined}
			step={field.kind === "number" ? field.step : undefined}
			placeholder={field.placeholder}
			autoComplete={field.autoComplete}
			defaultValue={field.kind === "number" ? (field.min ?? 1) : undefined}
			message={message}
			invalid={invalid}
		/>
	);
}

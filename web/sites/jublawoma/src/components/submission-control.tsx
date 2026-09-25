import { Field } from "@base-ui/react/field";
import { Select } from "@base-ui/react/select";
import { InputField } from "./input-field";

export interface SubmissionField {
	name: string;
	label: string;
	type?: "text" | "email" | "tel" | "date" | "number" | "textarea";
	required?: boolean;
	min?: number;
	max?: number;
	step?: number;
	rows?: number;
	options?: { value: string; label: string }[];
}

export function SubmissionControl({
	field,
	disabled,
}: {
	field: SubmissionField;
	disabled: boolean;
}) {
	if (field.options)
		return (
			<Field.Root name={field.name} className="grid gap-2">
				<Field.Label>{field.label}</Field.Label>
				<Select.Root
					disabled={disabled}
					name={field.name}
					defaultValue={field.options[0]?.value}
					required={field.required}
				>
					<Select.Trigger className="rounded-lg border border-current/20 px-3 py-2 text-left">
						<Select.Value />
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
			</Field.Root>
		);
	return (
		<InputField
			disabled={disabled}
			name={field.name}
			label={field.label}
			type={field.type === "textarea" ? undefined : (field.type ?? "text")}
			render={
				field.type === "textarea" ? (
					<textarea rows={field.rows ?? 5} />
				) : undefined
			}
			required={field.required}
			min={field.min}
			max={field.max}
			step={field.step}
			defaultValue={field.type === "number" ? (field.min ?? 1) : undefined}
		/>
	);
}

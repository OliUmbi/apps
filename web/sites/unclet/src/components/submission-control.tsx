import { Field } from "@base-ui/react/field";
import { Select } from "@base-ui/react/select";
import { m } from "@oliumbi/i18n/messages";
import { ChevronDown } from "lucide-react";
import { InputField } from "./input-field";
import { RatingControl } from "./rating-control";

export interface SubmissionField {
	name: string;
	label: string;
	type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "rating";
	required?: boolean;
	min?: number;
	step?: number;
	max?: number;
	placeholder?: string;
	autoComplete?: string;
	wide?: boolean;
	options?: { value: string; label: string }[];
}

export function SubmissionControl({
	field,
	disabled,
}: {
	field: SubmissionField;
	disabled: boolean;
}) {
	const label = field.required
		? field.label
		: `${field.label} (${m.optional()})`;
	if (field.type === "rating")
		return <RatingControl field={{ ...field, label }} disabled={disabled} />;
	if (field.options)
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
			</Field.Root>
		);
	return (
		<InputField
			disabled={disabled}
			name={field.name}
			label={label}
			type={field.type === "textarea" ? undefined : (field.type ?? "text")}
			render={field.type === "textarea" ? <textarea rows={5} /> : undefined}
			required={field.required}
			min={field.min}
			max={field.max}
			step={field.step}
			placeholder={field.placeholder}
			autoComplete={field.autoComplete}
			defaultValue={field.type === "number" ? (field.min ?? 1) : undefined}
		/>
	);
}

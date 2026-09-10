import type {
	ResourceField as FieldDefinition,
	RecordValue,
} from "@oliumbi/contracts";
import { localDateTime } from "../studio/date-input";
import type { ResourceId } from "../studio/resources";
import { ReferenceField } from "./reference-field";
import { Checkbox, Field, InputField, Select } from "./ui/index";
export function ResourceField({
	field,
	value,
	onChange,
	resourceId,
}: {
	field: FieldDefinition;
	resourceId: ResourceId;
	value: RecordValue;
	onChange: (value: RecordValue) => void;
}) {
	if (field.kind === "uuid")
		return (
			<ReferenceField
				field={field}
				resourceId={resourceId}
				value={value}
				onChange={onChange}
			/>
		);
	if (field.kind === "checkbox")
		return (
			<Field.Root name={field.name} className="flex items-center gap-3">
				<Checkbox.Root
					checked={Boolean(value)}
					onCheckedChange={onChange}
					className="grid size-5 place-items-center rounded border border-current/40 data-checked:bg-violet-600"
				>
					<Checkbox.Indicator>✓</Checkbox.Indicator>
				</Checkbox.Root>
				<Field.Label>{field.label}</Field.Label>
			</Field.Root>
		);
	if (field.kind === "status")
		return (
			<Field.Root name={field.name} className="grid gap-2">
				<Field.Label>{field.label}</Field.Label>
				<Select.Root
					value={String(value)}
					onValueChange={(value) => onChange(value)}
				>
					<Select.Trigger className="rounded-lg border border-current/20 p-2 text-left">
						<Select.Value />
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner className="z-70">
							<Select.Popup className="rounded-lg border border-current/20 bg-zinc-900 p-2 text-white">
								{["new", "in-progress", "completed", "cancelled"].map(
									(status) => (
										<Select.Item
											key={status}
											value={status}
											className="cursor-pointer rounded p-2 data-highlighted:bg-white/10"
										>
											<Select.ItemText>{status}</Select.ItemText>
										</Select.Item>
									),
								)}
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
			</Field.Root>
		);
	const type =
		field.kind === "slug"
			? "text"
			: field.kind === "textarea"
				? undefined
				: field.kind;
	const displayed =
		field.kind === "datetime-local" && value
			? localDateTime(String(value))
			: String(value ?? "");
	return (
		<InputField
			label={field.label}
			name={field.name}
			type={type}
			value={displayed}
			required={!field.nullable}
			min={field.min}
			max={field.max}
			step={field.integer ? 1 : "any"}
			render={field.kind === "textarea" ? <textarea rows={5} /> : undefined}
			onChange={(event) => {
				const value = event.target.value;
				onChange(
					value === "" && field.nullable
						? null
						: field.kind === "number"
							? Number(value)
							: field.kind === "datetime-local" && value
								? new Date(value).toISOString()
								: value,
				);
			}}
		/>
	);
}

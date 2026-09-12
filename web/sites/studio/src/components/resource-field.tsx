import type {
	ResourceField as FieldDefinition,
	RecordValue,
} from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { Check } from "lucide-react";
import { editableStatuses } from "../studio/record-display";
import type { ResourceId } from "../studio/resources";
import { DateField } from "./date-field";
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
	if (field.kind === "date" || field.kind === "datetime-local")
		return <DateField field={field} value={value} onChange={onChange} />;
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
					<Checkbox.Indicator>
						<Check size={13} aria-hidden="true" />
					</Checkbox.Indicator>
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
								{editableStatuses.map((status) => (
									<Select.Item
										key={status.value}
										value={status.value}
										className="cursor-pointer rounded p-2 data-highlighted:bg-white/10"
									>
										<Select.ItemText>{status.label}</Select.ItemText>
									</Select.Item>
								))}
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
	const displayed = String(value ?? "");
	return (
		<div
			className={field.kind === "textarea" ? "editor-field-wide" : undefined}
		>
			<InputField
				label={field.label}
				name={field.name}
				type={type}
				value={displayed}
				required={!field.nullable}
				min={field.min}
				max={field.max}
				step={field.integer ? 1 : "any"}
				render={
					field.kind === "textarea" ? (
						<textarea rows={field.name === "body" ? 18 : 6} />
					) : undefined
				}
				onChange={(event) => {
					const value = event.target.value;
					onChange(
						value === "" && field.nullable
							? null
							: field.kind === "number"
								? Number(value)
								: value,
					);
				}}
			/>
			{field.kind === "slug" && displayed && (
				<p className="slug-preview">
					{m.studio_slug_preview()}: {slugPath(resourceId, displayed)}
				</p>
			)}
			{field.name === "body" && (
				<p className="markdown-hint">{m.studio_markdown_hint()}</p>
			)}
		</div>
	);
}

function slugPath(resourceId: ResourceId, slug: string): string {
	const paths: Partial<Record<ResourceId, string>> = {
		"jublawoma.story": "/stories/",
		"unclet.showcase": "/showcases/",
		"zelglihof.article": "/latest/",
	};
	const base = paths[resourceId];
	return `${base ?? "/"}${slug}`;
}

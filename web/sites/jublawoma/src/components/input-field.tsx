import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";
export function InputField({
	label,
	name,
	...props
}: ComponentProps<typeof Field.Control> & { label: string; name: string }) {
	return (
		<Field.Root name={name} className="grid gap-2 text-sm">
			<Field.Label className="font-medium">{label}</Field.Label>
			<Field.Control
				{...props}
				className={`w-full rounded-lg border border-bark/20 bg-oat px-3 py-2 focus:outline-2 focus:outline-offset-2 disabled:opacity-50 ${typeof props.className === "string" ? props.className : ""}`}
			/>
			<Field.Error className="text-red-600" />
		</Field.Root>
	);
}

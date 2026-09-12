import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";
export function InputField({
	label,
	name,
	...props
}: ComponentProps<typeof Field.Control> & { label: string; name: string }) {
	return (
		<Field.Root name={name} className="form-field grid gap-2 text-sm">
			<Field.Label className="font-medium">{label}</Field.Label>
			<Field.Control
				{...props}
				className={`min-h-12 w-full rounded-xl border border-forest/20 bg-white/55 px-4 py-3 transition placeholder:text-ink/35 focus:border-clay focus:bg-white focus:outline-2 focus:outline-offset-2 disabled:opacity-50 ${typeof props.className === "string" ? props.className : ""}`}
			/>
			<Field.Error className="text-red-600" />
		</Field.Root>
	);
}

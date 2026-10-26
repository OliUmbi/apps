import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

/*
 * Text-like control with a reserved message slot under it: the slot always
 * renders (hint or per-field error), so validation feedback never moves the
 * elements around it.
 */
export function InputField({
	label,
	name,
	message,
	invalid,
	className,
	...props
}: ComponentProps<typeof Field.Control> & {
	label: string;
	name: string;
	message?: string | null;
	invalid?: boolean;
}) {
	const messageId = `${name}-message`;
	return (
		<Field.Root name={name} className="form-field grid gap-2 text-sm">
			<Field.Label className="font-medium">{label}</Field.Label>
			<Field.Control
				{...props}
				aria-invalid={invalid ? true : undefined}
				aria-describedby={messageId}
				className={(state) =>
					`min-h-12 w-full rounded-xl border border-forest/20 bg-white/55 px-4 py-3 transition placeholder:text-ink/35 focus:border-clay focus:bg-white focus:outline-2 focus:outline-offset-2 disabled:opacity-50 ${(typeof className === "function" ? className(state) : className) ?? ""}`
				}
			/>
			<p
				id={messageId}
				className={`min-h-5 text-sm ${invalid ? "text-danger" : "text-ink/60"}`}
			>
				{message}
			</p>
		</Field.Root>
	);
}

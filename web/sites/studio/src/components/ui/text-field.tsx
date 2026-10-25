import type { ComponentProps, ReactNode } from "react";
import { FieldControl, FieldLabel, FieldMessage, FieldRoot } from "./field";

/*
 * The only single-line and multi-line text entry. Use `render` for a textarea.
 */
export function TextField({
	label,
	name,
	hint,
	className,
	...props
}: ComponentProps<typeof FieldControl> & {
	label: string;
	name: string;
	hint?: ReactNode;
}) {
	return (
		<FieldRoot name={name}>
			<FieldLabel>{label}</FieldLabel>
			<FieldControl className={className} {...props} />
			<FieldMessage hint={hint} />
		</FieldRoot>
	);
}

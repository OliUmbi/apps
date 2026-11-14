import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps, ReactNode } from "react";

/*
 * The detail and edit screen layout: fields down one column, actions in a rail
 * beside them.
 *
 * Fields are deliberately one per row. A two column grid makes the reading
 * order zig-zag across rows and pairs fields by position rather than meaning.
 * The rail is sticky so the actions stay reachable at the bottom of a long
 * record, and on a narrow screen it stacks underneath instead.
 */

export function Form({ children, ...props }: ComponentProps<typeof BaseForm>) {
	return (
		<BaseForm
			className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10"
			{...props}
		>
			{children}
		</BaseForm>
	);
}

export function FormFields({
	disabled,
	children,
}: {
	disabled?: boolean;
	children: ReactNode;
}) {
	return (
		<fieldset
			disabled={disabled}
			className="grid w-full flex-1 content-start gap-6"
		>
			{children}
		</fieldset>
	);
}

export function FormActions({ children }: { children: ReactNode }) {
	return (
		<aside className="grid w-full gap-2 max-lg:sticky max-lg:bottom-0 max-lg:z-20 max-lg:border-y max-lg:border-line max-lg:bg-canvas max-lg:p-4 lg:sticky lg:top-24 lg:w-64">
			{children}
		</aside>
	);
}

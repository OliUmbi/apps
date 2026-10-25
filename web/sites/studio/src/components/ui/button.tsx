import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";

/*
 * The only button in the app. Variants are semantic: `primary` is the single
 * action a screen is about, `danger` is destructive. Nothing here is blue or
 * coloured except `danger`, per the neutral-only palette.
 */

const variants = {
	primary: "border-transparent bg-fg text-canvas hover:bg-white",
	secondary:
		"border-line bg-layer-1 text-fg hover:border-line-strong hover:bg-layer-2",
	ghost:
		"border-transparent bg-transparent text-fg-muted hover:bg-layer-2 hover:text-fg",
	link: "border-transparent bg-transparent px-0 text-interactive hover:underline",
	danger: "border-danger/40 bg-transparent text-danger hover:bg-danger/10",
} as const;

const sizes = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-4 text-sm",
} as const;

export function Button({
	variant = "secondary",
	size = "md",
	className,
	...props
}: ComponentProps<typeof BaseButton> & {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
}) {
	return (
		<BaseButton
			className={[
				"inline-flex shrink-0 items-center justify-center gap-2 rounded-control border font-medium",
				"transition-colors disabled:cursor-not-allowed disabled:opacity-40",
				variants[variant],
				sizes[size],
				className ?? "",
			].join(" ")}
			{...props}
		/>
	);
}

/*
 * Square icon control. The label is required because the button carries no
 * visible text.
 */
export function IconButton({
	label,
	className,
	children,
	...props
}: ComponentProps<typeof BaseButton> & {
	label: string;
	children: ReactNode;
}) {
	return (
		<BaseButton
			aria-label={label}
			className={[
				"inline-flex size-9 shrink-0 items-center justify-center rounded-control",
				"text-fg-muted transition-colors hover:bg-layer-2 hover:text-fg",
				className ?? "",
			].join(" ")}
			{...props}
		>
			{children}
		</BaseButton>
	);
}

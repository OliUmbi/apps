import { Button } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";

/*
 * A filter toggle: the chip-sized buttons that switch a list between views.
 * Replaces `.message-filter`; selection reproduces `.is-active` (a stronger
 * hairline and a raised fill instead of the retired violet glow) and `tone`
 * reproduces `.failure`, so the failure chip stays red whether or not it is
 * pressed. Selection only changes border and fill, never the box, so pressing
 * one chip does not move the chips beside it.
 */

const tones = {
	neutral: "text-fg-subtle",
	danger: "text-danger",
} as const;

const states = {
	idle: "border-line bg-layer-1",
	selected: "border-line-strong bg-layer-2",
} as const;

export function FilterChip({
	tone = "neutral",
	selected = false,
	children,
	...props
}: ComponentProps<typeof Button> & {
	tone?: keyof typeof tones;
	selected?: boolean;
	children: ReactNode;
}) {
	return (
		<Button
			{...props}
			aria-pressed={selected}
			className={[
				"grid min-h-10 gap-1 rounded-control border p-4 text-left text-xs uppercase tracking-[0.04em] transition-colors",
				tones[tone],
				selected ? states.selected : states.idle,
			].join(" ")}
		>
			{children}
		</Button>
	);
}

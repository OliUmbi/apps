import { Button } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";

const tones = {
	neutral: "text-fg-muted",
	danger: "text-danger",
} as const;

const states = {
	idle: "border-line bg-layer-1 hover:border-line-control",
	selected: "border-interactive bg-interactive/10 text-fg",
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
				"inline-flex min-h-9 items-center rounded-control border px-3 py-2 text-left font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors",
				tones[tone],
				selected ? states.selected : states.idle,
			].join(" ")}
		>
			{children}
		</Button>
	);
}

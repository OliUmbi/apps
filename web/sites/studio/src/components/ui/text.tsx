import type { ElementType, ReactNode } from "react";

/*
 * The type scale. Everything readable in the app goes through one of these, so
 * typography is never spelled out in a view and the `.page-kicker` /
 * `page-heading h1` CSS rules can be retired.
 */

const titles = {
	sm: "text-base font-semibold tracking-tight",
	md: "text-xl font-semibold tracking-tight",
	lg: "text-2xl font-semibold tracking-tight",
} as const;

export function Title({
	as: Tag = "h1",
	size = "md",
	children,
}: {
	as?: ElementType;
	size?: keyof typeof titles;
	children: ReactNode;
}) {
	return <Tag className={titles[size]}>{children}</Tag>;
}

export function Kicker({ children }: { children: ReactNode }) {
	return (
		<p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle">
			{children}
		</p>
	);
}

export function Body({ children }: { children: ReactNode }) {
	return <p className="text-sm leading-relaxed text-fg-muted">{children}</p>;
}

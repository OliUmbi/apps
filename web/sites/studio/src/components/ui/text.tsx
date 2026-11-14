import type { ElementType, ReactNode } from "react";

const titles = {
	sm: "text-base font-semibold tracking-[-0.015em]",
	md: "text-xl font-semibold tracking-[-0.025em]",
	lg: "text-3xl font-semibold tracking-[-0.04em] md:text-4xl",
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
		<p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
			{children}
		</p>
	);
}

export function Body({ children }: { children: ReactNode }) {
	return (
		<p className="max-w-2xl text-sm leading-6 text-fg-muted">{children}</p>
	);
}

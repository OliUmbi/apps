import { Button } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Kicker } from "./text";

/*
 * Sidebar navigation. Rows are 36px and carry a 2px leading marker that is
 * always present, transparent when idle, so switching state never shifts the
 * label.
 */

export function Nav({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<nav aria-label={label} className="grid gap-0.5 overflow-y-auto p-2">
			{children}
		</nav>
	);
}

export function NavSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div>
			<div className="px-3 pb-1 pt-4">
				<Kicker>{title}</Kicker>
			</div>
			{children}
		</div>
	);
}

export function NavItem({
	icon: Icon,
	active = false,
	children,
	...props
}: ComponentProps<typeof Button> & {
	icon?: LucideIcon;
	active?: boolean;
	children: ReactNode;
}) {
	return (
		<Button
			aria-current={active ? "page" : undefined}
			className={[
				"flex h-9 w-full items-center gap-2.5 border-l-2 px-3 text-left text-sm transition-colors",
				active
					? "border-fg bg-layer-2 font-medium text-fg"
					: "border-transparent text-fg-muted hover:bg-layer-2 hover:text-fg",
			].join(" ")}
			{...props}
		>
			{Icon ? <Icon size={15} strokeWidth={1.7} aria-hidden="true" /> : null}
			<span className="truncate">{children}</span>
		</Button>
	);
}

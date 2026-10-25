import type { ReactNode } from "react";

/*
 * The navigation rail. Full height, its own surface, separated from the content
 * by a hairline rather than a shadow.
 */

export function Sidebar({ children }: { children: ReactNode }) {
	return (
		<aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-line-subtle bg-layer-1 md:flex">
			{children}
		</aside>
	);
}

export function SidebarHeader({
	action,
	children,
}: {
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex h-14 shrink-0 items-center gap-2 border-b border-line-subtle px-3">
			<div className="flex min-w-0 flex-1 items-center">{children}</div>
			{action}
		</div>
	);
}

export function SidebarFooter({ children }: { children: ReactNode }) {
	return (
		<div className="mt-auto shrink-0 border-t border-line-subtle p-2">
			{children}
		</div>
	);
}

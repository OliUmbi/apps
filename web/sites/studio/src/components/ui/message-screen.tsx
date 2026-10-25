import type { ReactNode } from "react";

/*
 * The centred card used when a screen has no content to show: not found, a
 * failed load. Keeps the identity mark at the top so even an error screen looks
 * like part of the product.
 */
export function MessageScreen({
	brand,
	code,
	children,
}: {
	brand: ReactNode;
	code?: ReactNode;
	children: ReactNode;
}) {
	return (
		<main className="flex min-h-dvh items-center justify-center p-4">
			<div className="w-full max-w-sm overflow-hidden rounded-panel border border-line bg-layer-2 shadow-overlay">
				<div className="flex items-center gap-2.5 border-b border-line-subtle px-5 py-4">
					{brand}
				</div>
				{code ? (
					<div className="flex items-center gap-2.5 border-b border-line-subtle px-5 py-4 font-mono text-xs uppercase tracking-[0.08em] text-fg-subtle">
						{code}
					</div>
				) : null}
				<div className="grid gap-4 px-5 py-6">{children}</div>
			</div>
		</main>
	);
}

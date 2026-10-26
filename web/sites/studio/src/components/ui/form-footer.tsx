import type { ReactNode } from "react";

/*
 * The divider row that closes a form and holds its buttons. One leaf keeps the
 * hairline and its distance above the buttons the same everywhere; every form
 * used to draw the divider by hand.
 */
export function FormFooter({ children }: { children: ReactNode }) {
	return (
		<div className="flex justify-end gap-2 border-t border-line-subtle pt-5">
			{children}
		</div>
	);
}

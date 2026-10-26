import type { ReactNode } from "react";

/*
 * The divider row that closes a form and holds its buttons. Every form drew
 * this by hand as `border-t border-border-soft pt-[18px]`; one leaf keeps the
 * divider on the 4px rhythm and the same distance everywhere.
 */
export function FormFooter({ children }: { children: ReactNode }) {
	return (
		<div className="flex justify-end gap-2 border-t border-line-subtle pt-5">
			{children}
		</div>
	);
}

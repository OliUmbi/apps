import type { ReactNode } from "react";

/*
 * Form and screen feedback. The slot is always rendered at its full height so
 * showing or clearing a message never moves the controls around it.
 */

const tones = {
	error: "border-danger/40 bg-danger/10 text-danger",
	success: "border-success/40 bg-success/10 text-success",
	info: "border-line bg-layer-2 text-fg-muted",
} as const;

export function Alert({
	tone = "error",
	children,
}: {
	tone?: keyof typeof tones;
	children?: ReactNode;
}) {
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			aria-live={tone === "error" ? "assertive" : "polite"}
			className="min-h-10"
		>
			{children ? (
				<p
					className={`flex h-10 items-center gap-2 rounded-control border px-3 text-sm ${tones[tone]}`}
				>
					{children}
				</p>
			) : null}
		</div>
	);
}

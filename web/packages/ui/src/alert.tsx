import type { ReactNode } from "react";

/*
 * Reserved-space feedback shared by the studio and the public sites. The 40px
 * slot is always rendered, so showing or clearing a message never moves the
 * elements around it ("state changes never move anything"). Tones read the
 * `danger`/`success` theme tokens; each site defines `--color-danger` and
 * `--color-success` in its `@theme` block (token values stay site-local).
 */

const tones = {
	error: "border-danger/40 bg-danger/10 text-danger",
	success: "border-success/40 bg-success/10 text-success",
	info: "border-current/20 text-current",
} as const;

export type AlertTone = keyof typeof tones;

export function Alert({
	tone = "error",
	children,
}: {
	tone?: AlertTone;
	children?: ReactNode;
}) {
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			aria-live={tone === "error" ? "assertive" : "polite"}
			className="min-h-10"
		>
			{children ? (
				<div
					className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}
				>
					{children}
				</div>
			) : null}
		</div>
	);
}

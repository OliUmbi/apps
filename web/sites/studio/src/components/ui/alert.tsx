import { Children, type ReactNode } from "react";

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
	const content = Children.toArray(children);
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			aria-live={tone === "error" ? "assertive" : "polite"}
			className="min-h-10"
		>
			{content.length ? (
				<div
					className={`flex min-h-10 flex-wrap items-center gap-2 rounded-control border px-3 py-2 text-sm ${tones[tone]}`}
				>
					{content}
				</div>
			) : null}
		</div>
	);
}

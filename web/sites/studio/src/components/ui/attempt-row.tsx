import type { ReactNode } from "react";

/*
 * One delivery attempt in the timeline. Replaces the `.attempt-list li` rules:
 * a monospace index column beside the outcome line, its timestamp and the
 * failure detail. Rows sit inside `ListShell` (the old `.attempt-list`
 * hairline-gap stack), and only the error block is conditional, so rows of the
 * same list keep their rhythm.
 */
export function AttemptRow({
	index,
	outcome,
	timestamp,
	error,
}: {
	index: ReactNode;
	outcome: ReactNode;
	timestamp?: ReactNode;
	error?: ReactNode;
}) {
	return (
		<li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 bg-layer-1 px-6 py-5">
			<span className="font-mono text-sm text-fg-disabled">{index}</span>
			<div>
				<strong className="text-sm font-semibold text-fg">{outcome}</strong>
				{timestamp ? (
					<p className="mt-1 text-xs text-fg-subtle">{timestamp}</p>
				) : null}
				{error ? (
					<pre className="mt-3 overflow-auto whitespace-pre-wrap border-l-2 border-danger bg-danger/5 px-3 py-2.5 font-mono text-xs text-danger">
						{error}
					</pre>
				) : null}
			</div>
		</li>
	);
}

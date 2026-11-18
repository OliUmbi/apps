import { PanelsTopLeft } from "lucide-react";

/* A quiet workspace identity; site switchers retain their distinguishing initials. */
export function Brand({
	name,
	monogram,
	detail,
}: {
	name: string;
	monogram?: string;
	detail?: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="grid size-8 shrink-0 place-items-center rounded-control border border-line bg-layer-2 font-mono text-xs font-semibold text-fg">
				{monogram ?? (
					<PanelsTopLeft size={16} strokeWidth={1.6} aria-hidden="true" />
				)}
			</span>
			<span className="grid min-w-0 leading-tight">
				<span className="truncate text-sm font-semibold tracking-tight text-fg">
					{name}
				</span>
				{detail ? (
					<span className="mt-0.5 truncate font-mono text-[0.68rem] text-fg-subtle">
						{detail}
					</span>
				) : null}
			</span>
		</div>
	);
}

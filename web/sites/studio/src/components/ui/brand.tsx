/*
 * The identity mark. Used in the sidebar, the mobile drawer and error screens.
 * `detail` is an optional second line, e.g. the domain under a site name.
 */

export function Brand({
	name,
	monogram = "O",
	detail,
}: {
	name: string;
	monogram?: string;
	detail?: string;
}) {
	return (
		<div className="flex items-center gap-2.5">
			<span className="grid size-7 shrink-0 place-items-center rounded-control border border-line bg-layer-2 font-mono text-xs font-semibold text-fg">
				{monogram}
			</span>
			<span className="grid min-w-0 leading-tight">
				<span className="truncate text-sm font-semibold text-fg">{name}</span>
				{detail ? (
					<span className="truncate font-mono text-xs text-fg-subtle">
						{detail}
					</span>
				) : null}
			</span>
		</div>
	);
}

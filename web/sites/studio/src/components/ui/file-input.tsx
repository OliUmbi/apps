/*
 * File picker. The real input is hidden but still focusable, and the label
 * carries the focus ring so keyboard users see where they are.
 */

export function FileInput({
	label,
	accept,
	disabled,
	onSelect,
}: {
	label: string;
	accept?: string;
	disabled?: boolean;
	onSelect: (file: File) => void;
}) {
	return (
		<label
			className={[
				"flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-control",
				"border border-dashed border-line bg-layer-1 px-3 text-sm text-fg-subtle",
				"transition-colors hover:border-line-strong hover:text-fg-muted",
				"focus-within:border-interactive focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-interactive",
				disabled ? "cursor-not-allowed opacity-50" : "",
			].join(" ")}
		>
			<span>{label}</span>
			<input
				type="file"
				accept={accept}
				disabled={disabled}
				className="sr-only"
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) onSelect(file);
					event.target.value = "";
				}}
			/>
		</label>
	);
}

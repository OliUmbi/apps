export interface MarkdownSelection {
	value: string;
	start: number;
	end: number;
}

const blockPrefix = /^(#{1,3}|-|>)\s+/;

export function wrapSelection(
	state: MarkdownSelection,
	marker: string,
	placeholder: string,
): MarkdownSelection {
	const selected = state.value.slice(state.start, state.end);
	const inner = selected || placeholder;
	const value = `${state.value.slice(0, state.start)}${marker}${inner}${marker}${state.value.slice(state.end)}`;
	const start = state.start + marker.length;
	return { value, start, end: start + inner.length };
}

export function prefixLines(
	state: MarkdownSelection,
	prefix: string,
): MarkdownSelection {
	const lineStart = state.value.lastIndexOf("\n", state.start - 1) + 1;
	const lineEndIndex = state.value.indexOf("\n", state.end);
	const lineEnd = lineEndIndex === -1 ? state.value.length : lineEndIndex;
	const lines = state.value.slice(lineStart, lineEnd).split("\n");
	const remove = lines.every((line) => line.startsWith(prefix));
	const next = lines
		.map((line) =>
			remove
				? line.slice(prefix.length)
				: `${prefix}${line.replace(blockPrefix, "")}`,
		)
		.join("\n");
	const value =
		state.value.slice(0, lineStart) + next + state.value.slice(lineEnd);
	const delta = next.length - (lineEnd - lineStart);
	return {
		value,
		start: Math.max(
			lineStart,
			state.start + (remove ? -prefix.length : prefix.length),
		),
		end: Math.max(lineStart, state.end + delta),
	};
}

export function insertLink(state: MarkdownSelection): MarkdownSelection {
	const selected = state.value.slice(state.start, state.end);
	const label = selected || "Text";
	const href = "https://";
	const value = `${state.value.slice(0, state.start)}[${label}](${href})${state.value.slice(state.end)}`;
	const start = state.start + label.length + 3;
	return { value, start, end: start + href.length };
}

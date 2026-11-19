import { safeLinkHref } from "./links";

export type MarkdownInline =
	| { type: "text" | "strong" | "emphasis" | "code"; value: string }
	| { type: "link"; label: string; href: string };

export type MarkdownBlock =
	| { type: "heading"; level: 1 | 2 | 3; content: MarkdownInline[] }
	| { type: "paragraph"; lines: MarkdownInline[][] }
	| { type: "list"; items: MarkdownInline[][] }
	| { type: "quote"; content: MarkdownInline[] }
	| { type: "rule" };

/*
 * The content dialect. It is deliberately one form per style:
 *
 *   *bold*   _italic_   `code`   [label](href)
 *   # H1     ## H2      ### H3   - list   > quote   ---
 *
 * A single newline stays a line break inside a paragraph; a blank line starts
 * a new block. There is no HTML, image, table, ordered-list or fenced-code
 * syntax. Anything unrecognised stays literal text, and links only survive the
 * `safeLinkHref` allowlist.
 */
export function parseSimpleMarkdown(value: string): MarkdownBlock[] {
	const blocks: MarkdownBlock[] = [];
	let paragraph: MarkdownInline[][] = [];
	const flushParagraph = () => {
		if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
		paragraph = [];
	};

	for (const rawLine of normalizeLines(value)) {
		const line = rawLine.trimEnd();
		if (!line.trim()) {
			flushParagraph();
			continue;
		}
		if (line.trim() === "---") {
			flushParagraph();
			blocks.push({ type: "rule" });
			continue;
		}
		const heading = parseHeadingLine(line);
		if (heading) {
			flushParagraph();
			blocks.push({
				type: "heading",
				level: heading.level,
				content: parseInline(heading.content),
			});
			continue;
		}
		const listItem = parseListLine(line);
		if (listItem) {
			flushParagraph();
			const previous = blocks.at(-1);
			if (previous?.type === "list")
				previous.items.push(parseInline(listItem.content));
			else
				blocks.push({
					type: "list",
					items: [parseInline(listItem.content)],
				});
			continue;
		}
		if (line.startsWith("> ")) {
			flushParagraph();
			blocks.push({ type: "quote", content: parseInline(line.slice(2)) });
			continue;
		}
		paragraph.push(parseInline(line));
	}
	flushParagraph();
	return blocks;
}

/**
 * Plain-text projection for excerpts, meta descriptions and structured data.
 * It never returns markup; leftover marker characters from malformed or
 * legacy source are removed.
 */
export function markdownToPlainText(value: string): string {
	return parseSimpleMarkdown(value)
		.map((block) => {
			if (block.type === "rule") return "";
			if (block.type === "paragraph")
				return block.lines.map(inlineToText).join(" ");
			if (block.type === "list") return block.items.map(inlineToText).join(" ");
			return inlineToText(block.content);
		})
		.filter((part) => part.length > 0)
		.join("\n\n")
		.replace(/[*_`]/g, "")
		.trim();
}

function inlineToText(content: MarkdownInline[]): string {
	return content
		.map((inline) => (inline.type === "link" ? inline.label : inline.value))
		.join("");
}

function parseInline(value: string): MarkdownInline[] {
	const output: MarkdownInline[] = [];
	let cursor = 0;
	let textStart = 0;
	const flushText = (end: number) => {
		if (end > textStart)
			output.push({ type: "text", value: value.slice(textStart, end) });
	};

	while (cursor < value.length) {
		const token = parseInlineToken(value, cursor);
		if (!token) {
			cursor += 1;
			continue;
		}
		flushText(cursor);
		output.push(token.inline);
		cursor = token.end;
		textStart = cursor;
	}
	flushText(value.length);
	return output;
}

function normalizeLines(value: string) {
	return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function parseHeadingLine(line: string) {
	let level = 0;
	while (level < 3 && line[level] === "#") level += 1;
	if (level === 0 || line[level] !== " ") return null;
	return { level: level as 1 | 2 | 3, content: line.slice(level + 1) };
}

function parseListLine(line: string) {
	return line.startsWith("- ") ? { content: line.slice(2) } : null;
}

interface InlineToken {
	inline: MarkdownInline;
	end: number;
}

function parseInlineToken(value: string, start: number): InlineToken | null {
	// Historic doubled markers are not a second syntax: keep them literal.
	if (value.startsWith("**", start) || value.startsWith("__", start))
		return {
			inline: { type: "text", value: value.slice(start, start + 2) },
			end: start + 2,
		};
	if (value[start] === "*")
		return parseWrappedToken(value, start, "*", "strong");
	if (value[start] === "_")
		return parseWrappedToken(value, start, "_", "emphasis");
	if (value[start] === "`") return parseWrappedToken(value, start, "`", "code");
	if (value[start] !== "[") return null;
	const labelEnd = value.indexOf("](", start + 1);
	if (labelEnd < 0) return null;
	const hrefEnd = value.indexOf(")", labelEnd + 2);
	if (hrefEnd < 0) return null;
	const href = safeLinkHref(value.slice(labelEnd + 2, hrefEnd));
	if (!href) return null;
	return {
		inline: { type: "link", label: value.slice(start + 1, labelEnd), href },
		end: hrefEnd + 1,
	};
}

function parseWrappedToken(
	value: string,
	start: number,
	marker: string,
	type: "strong" | "emphasis" | "code",
): InlineToken | null {
	const contentStart = start + marker.length;
	const end = value.indexOf(marker, contentStart);
	if (end <= contentStart) return null;
	return {
		inline: { type, value: value.slice(contentStart, end) },
		end: end + marker.length,
	};
}

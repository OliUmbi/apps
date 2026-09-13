import { Fragment, type ReactNode } from "react";

export type MarkdownInline =
	| { type: "text" | "strong" | "emphasis" | "code"; value: string }
	| { type: "link"; label: string; href: string };

export type MarkdownBlock =
	| { type: "heading"; level: 1 | 2 | 3; content: MarkdownInline[] }
	| { type: "paragraph"; lines: MarkdownInline[][] }
	| { type: "list"; ordered: boolean; items: MarkdownInline[][] }
	| { type: "quote"; content: MarkdownInline[] }
	| { type: "rule" };

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
		const heading = headingLine(line);
		if (heading) {
			flushParagraph();
			blocks.push({
				type: "heading",
				level: heading.level,
				content: parseInline(heading.content),
			});
			continue;
		}
		const listItem = listLine(line);
		if (listItem) {
			flushParagraph();
			const previous = blocks.at(-1);
			if (previous?.type === "list" && previous.ordered === listItem.ordered)
				previous.items.push(parseInline(listItem.content));
			else
				blocks.push({
					type: "list",
					ordered: listItem.ordered,
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

export function parseInline(value: string): MarkdownInline[] {
	const output: MarkdownInline[] = [];
	let cursor = 0;
	let textStart = 0;
	const flushText = (end: number) => {
		if (end > textStart)
			output.push({ type: "text", value: value.slice(textStart, end) });
	};

	while (cursor < value.length) {
		const token = inlineToken(value, cursor);
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

export function SimpleMarkdown({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	if (!value.trim()) return null;
	return (
		<div className={className}>
			{parseSimpleMarkdown(value).map(renderBlock)}
		</div>
	);
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
	const key = `${block.type}-${index}`;
	if (block.type === "rule") return <hr key={key} />;
	if (block.type === "quote")
		return <blockquote key={key}>{renderInline(block.content)}</blockquote>;
	if (block.type === "list") {
		const items = block.items.map((item, itemIndex) => (
			<li key={`${key}-${itemIndex}`}>{renderInline(item)}</li>
		));
		return block.ordered ? (
			<ol key={key}>{items}</ol>
		) : (
			<ul key={key}>{items}</ul>
		);
	}
	if (block.type === "heading") {
		const content = renderInline(block.content);
		if (block.level === 1) return <h1 key={key}>{content}</h1>;
		if (block.level === 2) return <h2 key={key}>{content}</h2>;
		return <h3 key={key}>{content}</h3>;
	}
	return (
		<p key={key}>
			{block.lines.map((line, lineIndex) => (
				<Fragment key={`${key}-${lineIndex}`}>
					{lineIndex > 0 ? <br /> : null}
					{renderInline(line)}
				</Fragment>
			))}
		</p>
	);
}

function renderInline(content: MarkdownInline[]) {
	return content.map((item, index) => {
		const key = `${item.type}-${index}`;
		if (item.type === "strong") return <strong key={key}>{item.value}</strong>;
		if (item.type === "emphasis") return <em key={key}>{item.value}</em>;
		if (item.type === "code") return <code key={key}>{item.value}</code>;
		if (item.type === "link")
			return (
				<a key={key} href={item.href}>
					{item.label}
				</a>
			);
		return <Fragment key={key}>{item.value}</Fragment>;
	});
}

function normalizeLines(value: string) {
	return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function headingLine(line: string) {
	let level = 0;
	while (level < 3 && line[level] === "#") level += 1;
	if (level === 0 || line[level] !== " ") return null;
	return { level: level as 1 | 2 | 3, content: line.slice(level + 1) };
}

function listLine(line: string) {
	if (line.startsWith("- ") || line.startsWith("* "))
		return { ordered: false, content: line.slice(2) };
	let cursor = 0;
	while (cursor < line.length && line[cursor] >= "0" && line[cursor] <= "9")
		cursor += 1;
	if (cursor > 0 && line.slice(cursor, cursor + 2) === ". ")
		return { ordered: true, content: line.slice(cursor + 2) };
	return null;
}

function inlineToken(
	value: string,
	start: number,
): { inline: MarkdownInline; end: number } | null {
	if (value.startsWith("**", start))
		return wrappedToken(value, start, "**", "strong");
	if (value[start] === "*") return wrappedToken(value, start, "*", "emphasis");
	if (value[start] === "_") return wrappedToken(value, start, "_", "emphasis");
	if (value[start] === "`") return wrappedToken(value, start, "`", "code");
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

function wrappedToken(
	value: string,
	start: number,
	marker: string,
	type: "strong" | "emphasis" | "code",
) {
	const contentStart = start + marker.length;
	const end = value.indexOf(marker, contentStart);
	if (end <= contentStart) return null;
	return {
		inline: { type, value: value.slice(contentStart, end) } as MarkdownInline,
		end: end + marker.length,
	};
}

export function safeLinkHref(value: string): string | undefined {
	if (
		(value.startsWith("/") && !value.startsWith("//")) ||
		value.startsWith("#")
	)
		return value;
	try {
		return ["http:", "https:", "mailto:"].includes(new URL(value).protocol)
			? value
			: undefined;
	} catch {
		return undefined;
	}
}

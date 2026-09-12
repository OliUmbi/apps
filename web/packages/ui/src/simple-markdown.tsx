import { Fragment, type ReactNode } from "react";

export type MarkdownInline =
	| { type: "text"; value: string }
	| { type: "strong" | "emphasis"; value: string }
	| { type: "link"; label: string; href: string };

export type MarkdownBlock =
	| { type: "heading"; level: 1 | 2 | 3; content: MarkdownInline[] }
	| { type: "paragraph"; lines: MarkdownInline[][] }
	| { type: "rule" };

const inlinePattern =
	/(\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_)/g;

export function parseSimpleMarkdown(value: string): MarkdownBlock[] {
	const blocks: MarkdownBlock[] = [];
	let paragraph: MarkdownInline[][] = [];
	const flushParagraph = () => {
		if (!paragraph.length) return;
		blocks.push({ type: "paragraph", lines: paragraph });
		paragraph = [];
	};

	for (const rawLine of value.replace(/\r\n?/g, "\n").split("\n")) {
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
		const heading = /^(#{1,3})\s+(.+)$/.exec(line);
		if (heading) {
			flushParagraph();
			blocks.push({
				type: "heading",
				level: heading[1].length as 1 | 2 | 3,
				content: parseInline(heading[2]),
			});
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
	for (const match of value.matchAll(inlinePattern)) {
		const index = match.index ?? 0;
		if (index > cursor)
			output.push({ type: "text", value: value.slice(cursor, index) });
		if (match[2] && match[3] && safeLinkHref(match[3]))
			output.push({ type: "link", label: match[2], href: match[3] });
		else if (match[4]) output.push({ type: "strong", value: match[4] });
		else if (match[5] || match[6])
			output.push({ type: "emphasis", value: match[5] ?? match[6] });
		else output.push({ type: "text", value: match[0] });
		cursor = index + match[0].length;
	}
	if (cursor < value.length)
		output.push({ type: "text", value: value.slice(cursor) });
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
			{parseSimpleMarkdown(value).map((block, index) =>
				renderBlock(block, index),
			)}
		</div>
	);
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
	if (block.type === "rule") return <hr key={`rule-${index}`} />;
	if (block.type === "heading") {
		const content = renderInline(block.content);
		if (block.level === 1) return <h1 key={`h1-${index}`}>{content}</h1>;
		if (block.level === 2) return <h2 key={`h2-${index}`}>{content}</h2>;
		return <h3 key={`h3-${index}`}>{content}</h3>;
	}
	return (
		<p key={`paragraph-${index}`}>
			{block.lines.map((line, lineIndex) => (
				<Fragment key={`line-${lineIndex}`}>
					{lineIndex > 0 && <br />}
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
		if (item.type === "link")
			return (
				<a key={key} href={item.href}>
					{item.label}
				</a>
			);
		return <Fragment key={key}>{item.value}</Fragment>;
	});
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

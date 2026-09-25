import { Fragment, type ReactNode } from "react";
import {
	type MarkdownBlock,
	type MarkdownInline,
	parseSimpleMarkdown,
} from "./parse-simple-markdown";

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

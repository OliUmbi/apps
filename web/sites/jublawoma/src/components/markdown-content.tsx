import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";

export function MarkdownContent({ value }: Readonly<{ value: string }>) {
	return <SimpleMarkdown value={value} className="markdown-content" />;
}

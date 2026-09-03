import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
	const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**"))
			return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
		if (part.startsWith("*") && part.endsWith("*"))
			return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
		return part;
	});
}

export function MarkdownContent({ value }: Readonly<{ value: string }>) {
	if (!value.trim()) return null;
	return (
		<div className="markdown-content">
			{value.split(/\n\s*\n/).map((block, index) => {
				const text = block.trim();
				if (text === "---") return <hr key={`hr-${index}`} />;
				if (text.startsWith("## "))
					return <h2 key={`h2-${index}`}>{inline(text.slice(3))}</h2>;
				if (text.startsWith("### "))
					return <h3 key={`h3-${index}`}>{inline(text.slice(4))}</h3>;
				return <p key={`p-${index}`}>{inline(text)}</p>;
			})}
		</div>
	);
}

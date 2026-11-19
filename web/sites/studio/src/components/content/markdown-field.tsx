import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import {
	Bold,
	Code,
	Eye,
	Heading2,
	Heading3,
	Italic,
	Link2,
	List,
	Pencil,
	Quote,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button, IconButton } from "../ui/button";
import { FieldControl, FieldLabel, FieldMessage, FieldRoot } from "../ui/field";
import {
	insertLink,
	type MarkdownSelection,
	prefixLines,
	wrapSelection,
} from "./markdown-commands";

type MarkdownFieldProps = {
	name: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	rows?: number;
	required?: boolean;
	hint?: string;
};

/*
 * Long-form content source. The toolbar is intentionally the only command
 * surface: one marker per style, no HTML and no second syntax.
 */
export function MarkdownField({
	name,
	label,
	value,
	onChange,
	rows = 18,
	required,
	hint,
}: MarkdownFieldProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [preview, setPreview] = useState(false);

	const apply = (command: (state: MarkdownSelection) => MarkdownSelection) => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const next = command({
			value,
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		});
		onChange(next.value);
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(next.start, next.end);
		});
	};

	return (
		<FieldRoot name={name}>
			<div className="flex items-center justify-between gap-2">
				<FieldLabel>{label}</FieldLabel>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					aria-pressed={preview}
					onClick={() => setPreview((current) => !current)}
				>
					{preview ? (
						<Pencil size={14} aria-hidden="true" />
					) : (
						<Eye size={14} aria-hidden="true" />
					)}
					{preview
						? m.studio_markdown_preview_hide()
						: m.studio_markdown_preview()}
				</Button>
			</div>
			<div className="grid">
				<div
					role="toolbar"
					aria-label={m.studio_markdown_toolbar()}
					className="flex flex-wrap items-center gap-0.5 rounded-t-control border border-line-control bg-layer-1 p-1"
					onMouseDown={(event) => event.preventDefault()}
				>
					<IconButton
						type="button"
						label={m.studio_markdown_bold()}
						onClick={() => apply((state) => wrapSelection(state, "*", "fett"))}
					>
						<Bold size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_italic()}
						onClick={() =>
							apply((state) => wrapSelection(state, "_", "kursiv"))
						}
					>
						<Italic size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_link()}
						onClick={() => apply(insertLink)}
					>
						<Link2 size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_heading2()}
						onClick={() => apply((state) => prefixLines(state, "## "))}
					>
						<Heading2 size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_heading3()}
						onClick={() => apply((state) => prefixLines(state, "### "))}
					>
						<Heading3 size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_list()}
						onClick={() => apply((state) => prefixLines(state, "- "))}
					>
						<List size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_quote()}
						onClick={() => apply((state) => prefixLines(state, "> "))}
					>
						<Quote size={15} aria-hidden="true" />
					</IconButton>
					<IconButton
						type="button"
						label={m.studio_markdown_code()}
						onClick={() => apply((state) => wrapSelection(state, "`", "Code"))}
					>
						<Code size={15} aria-hidden="true" />
					</IconButton>
				</div>
				<FieldControl
					ref={textareaRef}
					render={<textarea rows={rows} />}
					value={value}
					required={required}
					onChange={(event) => onChange(event.target.value)}
					className="rounded-t-none border-t-0 font-mono text-[0.8125rem] leading-6"
				/>
			</div>
			{preview && (
				<div className="rounded-control border border-line-subtle bg-field p-4">
					{value.trim() ? (
						<SimpleMarkdown value={value} className="studio-markdown" />
					) : (
						<p className="text-xs text-fg-subtle">
							{m.studio_markdown_empty()}
						</p>
					)}
				</div>
			)}
			<FieldMessage hint={hint ?? m.studio_markdown_hint()} />
			<details className="text-xs text-fg-subtle">
				<summary className="cursor-pointer select-none">
					{m.studio_markdown_help()}
				</summary>
				<pre className="mt-2 whitespace-pre-wrap rounded-control border border-line-subtle bg-field p-3 font-mono text-[0.75rem] leading-5">
					{m.studio_markdown_help_examples()}
				</pre>
				<p className="mt-2">{m.studio_markdown_help_note()}</p>
			</details>
		</FieldRoot>
	);
}

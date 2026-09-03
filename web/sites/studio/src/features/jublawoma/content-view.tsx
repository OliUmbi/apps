import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	CalendarDays,
	ExternalLink,
	FileText,
	Image,
	Plus,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { saveJublawomaContent } from "./content.functions";
import type {
	ManagedEvent,
	ManagedMedia,
	ManagedStory,
	MediaInput,
} from "./content.server";

function mediaText(media: ManagedMedia[]) {
	return media.map((item) => `${item.storageKey} | ${item.altText}`).join("\n");
}
function parseMedia(value: string): MediaInput[] {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line, position) => {
			const separator = line.indexOf("|");
			const storageKey = (
				separator >= 0 ? line.slice(0, separator) : line
			).trim();
			const altText = (separator >= 0 ? line.slice(separator + 1) : "").trim();
			return {
				storageKey,
				altText,
				role: position === 0 ? ("cover" as const) : ("gallery" as const),
				position,
			};
		});
}
function slugify(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export function EventContentView({
	events,
}: Readonly<{ events: ManagedEvent[] }>) {
	const [selected, setSelected] = useState<ManagedEvent | null | undefined>();
	return (
		<ContentLayout
			title="Anlässe"
			copy="Termine gemeinsam mit Text, Veröffentlichung und einer getrennten Bilderliste pflegen."
			count={events.length}
			onNew={() => setSelected(null)}
		>
			{selected !== undefined ? (
				<EventEditor
					key={selected?.id ?? "new"}
					event={selected}
					onClose={() => setSelected(undefined)}
				/>
			) : (
				<RecordList
					empty="Noch keine Anlässe."
					icon={<CalendarDays size={18} />}
				>
					{events.map((event) => (
						<button
							type="button"
							className="content-record"
							key={event.id}
							onClick={() => setSelected(event)}
						>
							<span className="record-date">
								{new Date(`${event.startsOn}T12:00:00`).toLocaleDateString(
									"de-CH",
									{ day: "2-digit", month: "short" },
								)}
							</span>
							<span>
								<strong>{event.title}</strong>
								<small>
									{event.location || "Ort offen"} · {event.media.length} Bilder
								</small>
							</span>
							<Status value={event.status} />
						</button>
					))}
				</RecordList>
			)}
		</ContentLayout>
	);
}

export function StoryContentView({
	stories,
}: Readonly<{ stories: ManagedStory[] }>) {
	const [selected, setSelected] = useState<ManagedStory | null | undefined>();
	return (
		<ContentLayout
			title="Geschichten"
			copy="Markdown bleibt reiner Text; Titelbild und Galerie werden daneben geordnet."
			count={stories.length}
			onNew={() => setSelected(null)}
		>
			{selected !== undefined ? (
				<StoryEditor
					key={selected?.id ?? "new"}
					story={selected}
					onClose={() => setSelected(undefined)}
				/>
			) : (
				<RecordList
					empty="Noch keine Geschichten."
					icon={<FileText size={18} />}
				>
					{stories.map((story) => (
						<button
							type="button"
							className="content-record"
							key={story.id}
							onClick={() => setSelected(story)}
						>
							<span className="record-date">
								{story.publishedOn
									? new Date(
											`${story.publishedOn}T12:00:00`,
										).toLocaleDateString("de-CH", {
											day: "2-digit",
											month: "short",
										})
									: "–"}
							</span>
							<span>
								<strong>{story.title}</strong>
								<small>
									{story.summary || "Keine Kurzbeschreibung"} ·{" "}
									{story.media.length} Bilder
								</small>
							</span>
							<Status value={story.status} />
						</button>
					))}
				</RecordList>
			)}
		</ContentLayout>
	);
}

function ContentLayout({
	title,
	copy,
	count,
	onNew,
	children,
}: Readonly<{
	title: string;
	copy: string;
	count: number;
	onNew: () => void;
	children: React.ReactNode;
}>) {
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">Jubla Woma · Inhalte</p>
					<h1>{title}</h1>
					<p>{copy}</p>
				</div>
				<button type="button" className="button primary" onClick={onNew}>
					<Plus size={14} /> Neu
				</button>
			</header>
			<section className="panel">
				<div className="panel-header">
					<div>
						<h2>{title}</h2>
						<p>{count} Einträge</p>
					</div>
				</div>
				{children}
			</section>
		</div>
	);
}
function RecordList({
	empty,
	icon,
	children,
}: Readonly<{
	empty: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}>) {
	return (
		<div className="content-records">
			{Array.isArray(children) && children.length === 0 ? (
				<div className="empty-state">
					{icon}
					<p>{empty}</p>
				</div>
			) : (
				children
			)}
		</div>
	);
}
function Status({ value }: Readonly<{ value: string }>) {
	const labels: Record<string, string> = {
		draft: "Entwurf",
		published: "Publiziert",
		cancelled: "Abgesagt",
	};
	return (
		<span className={`status-label ${value === "published" ? "ready" : ""}`}>
			{labels[value] ?? value}
		</span>
	);
}

function EventEditor({
	event,
	onClose,
}: Readonly<{ event: ManagedEvent | null; onClose: () => void }>) {
	const router = useRouter();
	const action = useServerFn(saveJublawomaContent);
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState("");
	async function submit(formEvent: FormEvent<HTMLFormElement>) {
		formEvent.preventDefault();
		setBusy(true);
		setNotice("");
		const form = new FormData(formEvent.currentTarget);
		try {
			await action({
				data: {
					action: "jublawoma-event-save",
					id: event?.id,
					slug: String(form.get("slug")),
					title: String(form.get("title")),
					summary: String(form.get("summary")),
					bodyMarkdown: String(form.get("bodyMarkdown")),
					startsOn: String(form.get("startsOn")),
					endsOn: String(form.get("endsOn")),
					location: String(form.get("location")),
					registrationUrl: String(form.get("registrationUrl")),
					status: String(form.get("status")) as ManagedEvent["status"],
					media: parseMedia(String(form.get("media"))),
				},
			});
			setNotice("Anlass gespeichert.");
			await router.invalidate();
			if (!event) onClose();
		} catch (error) {
			setNotice(
				error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<EditorForm
			onSubmit={submit}
			onClose={onClose}
			notice={notice}
			busy={busy}
			preview={
				event ? `https://jublawoma.ch/anlaesse/${event.slug}` : undefined
			}
		>
			<FormField label="Titel">
				<input
					required
					name="title"
					defaultValue={event?.title}
					onBlur={(e) => {
						const slug = e.currentTarget.form?.elements.namedItem(
							"slug",
						) as HTMLInputElement;
						if (slug && !slug.value)
							slug.value = slugify(e.currentTarget.value);
					}}
				/>
			</FormField>
			<FormField label="URL-Name">
				<input
					required
					name="slug"
					pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
					defaultValue={event?.slug}
				/>
			</FormField>
			<FormField label="Start">
				<input
					required
					type="date"
					name="startsOn"
					defaultValue={event?.startsOn}
				/>
			</FormField>
			<FormField label="Ende">
				<input
					required
					type="date"
					name="endsOn"
					defaultValue={event?.endsOn}
				/>
			</FormField>
			<FormField label="Ort">
				<input name="location" defaultValue={event?.location} />
			</FormField>
			<FormField label="Status">
				<select name="status" defaultValue={event?.status ?? "draft"}>
					<option value="draft">Entwurf</option>
					<option value="published">Publiziert</option>
					<option value="cancelled">Abgesagt</option>
				</select>
			</FormField>
			<FormField label="Kurzbeschreibung" wide>
				<textarea
					name="summary"
					maxLength={500}
					rows={2}
					defaultValue={event?.summary}
				/>
			</FormField>
			<FormField label="Anmeldelink" wide>
				<input
					type="url"
					name="registrationUrl"
					defaultValue={event?.registrationUrl ?? ""}
					placeholder="https://…"
				/>
			</FormField>
			<FormField label="Text (Markdown)" wide>
				<textarea
					name="bodyMarkdown"
					rows={10}
					defaultValue={event?.bodyMarkdown}
					placeholder="## Zwischentitel\n\nText mit **fetter** oder *kursiver* Hervorhebung."
				/>
			</FormField>
			<MediaField value={event ? mediaText(event.media) : ""} />
		</EditorForm>
	);
}

function StoryEditor({
	story,
	onClose,
}: Readonly<{ story: ManagedStory | null; onClose: () => void }>) {
	const router = useRouter();
	const action = useServerFn(saveJublawomaContent);
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState("");
	async function submit(formEvent: FormEvent<HTMLFormElement>) {
		formEvent.preventDefault();
		setBusy(true);
		setNotice("");
		const form = new FormData(formEvent.currentTarget);
		try {
			await action({
				data: {
					action: "jublawoma-story-save",
					id: story?.id,
					slug: String(form.get("slug")),
					title: String(form.get("title")),
					summary: String(form.get("summary")),
					bodyMarkdown: String(form.get("bodyMarkdown")),
					publishedOn: String(form.get("publishedOn")),
					status: String(form.get("status")) as ManagedStory["status"],
					media: parseMedia(String(form.get("media"))),
				},
			});
			setNotice("Geschichte gespeichert.");
			await router.invalidate();
			if (!story) onClose();
		} catch (error) {
			setNotice(
				error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<EditorForm
			onSubmit={submit}
			onClose={onClose}
			notice={notice}
			busy={busy}
			preview={
				story ? `https://jublawoma.ch/geschichten/${story.slug}` : undefined
			}
		>
			<FormField label="Titel">
				<input
					required
					name="title"
					defaultValue={story?.title}
					onBlur={(e) => {
						const slug = e.currentTarget.form?.elements.namedItem(
							"slug",
						) as HTMLInputElement;
						if (slug && !slug.value)
							slug.value = slugify(e.currentTarget.value);
					}}
				/>
			</FormField>
			<FormField label="URL-Name">
				<input
					required
					name="slug"
					pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
					defaultValue={story?.slug}
				/>
			</FormField>
			<FormField label="Datum">
				<input
					type="date"
					name="publishedOn"
					defaultValue={story?.publishedOn ?? ""}
				/>
			</FormField>
			<FormField label="Status">
				<select name="status" defaultValue={story?.status ?? "draft"}>
					<option value="draft">Entwurf</option>
					<option value="published">Publiziert</option>
				</select>
			</FormField>
			<FormField label="Kurzbeschreibung" wide>
				<textarea
					required
					name="summary"
					maxLength={500}
					rows={3}
					defaultValue={story?.summary}
				/>
			</FormField>
			<FormField label="Text (Markdown)" wide>
				<textarea
					name="bodyMarkdown"
					rows={14}
					defaultValue={story?.bodyMarkdown}
					placeholder="## Zwischentitel\n\nDie Geschichte …"
				/>
			</FormField>
			<MediaField value={story ? mediaText(story.media) : ""} />
		</EditorForm>
	);
}

function EditorForm({
	onSubmit,
	onClose,
	notice,
	busy,
	preview,
	children,
}: Readonly<{
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onClose: () => void;
	notice: string;
	busy: boolean;
	preview?: string;
	children: React.ReactNode;
}>) {
	return (
		<form className="content-editor" onSubmit={onSubmit}>
			<div className="editor-toolbar">
				<button
					type="button"
					className="button secondary small"
					onClick={onClose}
				>
					Zurück
				</button>
				<div>
					{preview ? (
						<a
							href={preview}
							target="_blank"
							rel="noreferrer"
							className="button secondary small"
						>
							Vorschau <ExternalLink size={12} />
						</a>
					) : null}
					<button
						disabled={busy}
						type="submit"
						className="button primary small"
					>
						{busy ? "Speichert …" : "Speichern"}
					</button>
				</div>
			</div>
			{notice ? <div className="notice">{notice}</div> : null}
			<div className="editor-grid">{children}</div>
		</form>
	);
}
function FormField({
	label,
	wide = false,
	children,
}: Readonly<{ label: string; wide?: boolean; children: React.ReactNode }>) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Every FormField caller nests its form control in this label.
		<label className={wide ? "editor-field wide" : "editor-field"}>
			<span>{label}</span>
			{children}
		</label>
	);
}
function MediaField({ value }: Readonly<{ value: string }>) {
	return (
		<FormField label="Bilder · erstes Bild ist das Titelbild" wide>
			<div className="media-help">
				<Image size={14} />
				<span>
					Eine Zeile pro Bild:{" "}
					<code>/pfad/zum/bild.jpg | Aussagekräftiger Alternativtext</code>.
					Ohne Bild erscheint automatisch eine Jubla-Illustration.
				</span>
			</div>
			<textarea
				name="media"
				rows={6}
				defaultValue={value}
				placeholder="/assets/images/mein-bild.jpg | Kinder und Leitende am Lagerfeuer"
			/>
		</FormField>
	);
}

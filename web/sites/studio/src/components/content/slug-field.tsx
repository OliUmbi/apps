import { useState } from "react";
import { slugify } from "../../model/content/slug";
import { TextField } from "../ui/text-field";

export function SlugField({
	title,
	slug,
	onTitleChange,
	onSlugChange,
}: {
	title: string;
	slug: string;
	onTitleChange: (value: string) => void;
	onSlugChange: (value: string) => void;
}) {
	const [automatic, setAutomatic] = useState(!slug);
	return (
		<>
			<TextField
				name="title"
				label="Titel"
				required
				value={title}
				onChange={(event) => {
					const title = event.target.value;
					onTitleChange(title);
					if (automatic) onSlugChange(slugify(title));
				}}
			/>
			<TextField
				name="slug"
				label="URL-Kürzel"
				required
				maxLength={120}
				value={slug}
				onChange={(event) => {
					setAutomatic(false);
					onSlugChange(event.target.value);
				}}
			/>
		</>
	);
}

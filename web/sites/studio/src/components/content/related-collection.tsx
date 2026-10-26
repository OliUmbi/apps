import { useState } from "react";
import type { CollectionSelection } from "../../model/collection";
import { Title } from "../ui/text";
import { Collection, type CollectionProps } from "./collection";

// The related page type: an inline panel inside a detail page, with its own
// local selection state and a subheading instead of the page header.
export function RelatedCollection<Row, Input = never>(
	props: CollectionProps<Row, Input>,
) {
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<CollectionSelection<Row>>({
		mode: "list",
	});
	return (
		<Collection
			{...props}
			key={selection.mode === "detail" ? selection.id : selection.mode}
			search={search}
			onSearchChange={setSearch}
			navigation={{
				selection,
				showList: () => setSelection({ mode: "list" }),
				showCreate: () => setSelection({ mode: "create" }),
				showRecord: (record) =>
					setSelection({
						mode: "detail",
						id: props.rowKey(record),
						record: props.loadRecord ? undefined : record,
					}),
			}}
			renderHeader={(title, actions) => (
				<header className="flex items-center justify-between gap-4">
					<Title as="h3" size="sm">
						{title}
					</Title>
					<div className="flex flex-wrap gap-2">{actions}</div>
				</header>
			)}
		/>
	);
}

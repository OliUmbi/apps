import { useState } from "react";
import type { CollectionSelection } from "../../model/collection";
import { CollectionView, type CollectionViewProps } from "./collection-view";

export function InlineCollectionView<Row, Input = never>(
	props: CollectionViewProps<Row, Input>,
) {
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<CollectionSelection<Row>>({
		mode: "list",
	});
	return (
		<CollectionView
			{...props}
			key={selection.mode === "detail" ? selection.id : selection.mode}
			inline
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
		/>
	);
}

import { useState } from "react";
import type { CollectionSelection } from "../../model/collection";
import { Route } from "../../routes/index";
import { CollectionView, type CollectionViewProps } from "./collection-view";

export function RoutedCollectionView<Row, Input = never>(
	props: CollectionViewProps<Row, Input> & {
		loadRecord: (id: string) => Promise<Row | null>;
	},
) {
	const [filter, setFilter] = useState("");
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	let selection: CollectionSelection<Row> = { mode: "list" };
	if (search.mode === "create") selection = { mode: "create" };
	if (search.mode === "detail" && search.record) {
		selection = { mode: "detail", id: search.record };
	}
	function select(selection: CollectionSelection<Row>) {
		void navigate({
			search: {
				...search,
				mode: selection.mode,
				record: selection.mode === "detail" ? selection.id : undefined,
			},
		});
	}
	return (
		<CollectionView
			{...props}
			key={selection.mode === "detail" ? selection.id : selection.mode}
			search={filter}
			onSearchChange={setFilter}
			navigation={{
				selection,
				showList: () => select({ mode: "list" }),
				showCreate: () => select({ mode: "create" }),
				showRecord: (record) =>
					select({ mode: "detail", id: props.rowKey(record) }),
			}}
		/>
	);
}

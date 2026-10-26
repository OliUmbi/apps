import { useState } from "react";
import { useStudioSearch } from "../../hooks/use-studio-search";
import type { CollectionSelection } from "../../model/collection";
import { PageHeader } from "../ui/page-header";
import { Collection, type CollectionProps } from "./collection";

// The routed page type: the URL search params carry the selection (mode and
// record), so deep links into a section keep working.
export function PageCollection<Row, Input = never>(
	props: CollectionProps<Row, Input>,
) {
	const { search, navigate } = useStudioSearch();
	const [filter, setFilter] = useState("");
	let selection: CollectionSelection<Row> = { mode: "list" };
	if (search.mode === "create") selection = { mode: "create" };
	if (search.mode === "detail" && search.record) {
		selection = { mode: "detail", id: search.record };
	}
	function select(selection: CollectionSelection<Row>) {
		navigate({
			...search,
			mode: selection.mode,
			record: selection.mode === "detail" ? selection.id : undefined,
		});
	}
	return (
		<Collection
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
			renderHeader={(title, actions) => (
				<PageHeader title={title} actions={actions} />
			)}
		/>
	);
}

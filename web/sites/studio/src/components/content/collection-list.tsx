import { Button } from "@base-ui/react/button";
import { limits, type Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import type {
	InfiniteData,
	UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { InputField } from "../input-field";
import { CollectionTable, type ContentColumn } from "./collection-table";

export function CollectionList<Row>({
	query,
	search,
	onSearchChange,
	columns,
	rowKey,
	onOpen,
	children,
}: {
	query: UseInfiniteQueryResult<InfiniteData<Page<Row>>>;
	search: string;
	onSearchChange: (search: string) => void;
	columns: readonly ContentColumn<Row>[];
	rowKey: (record: Row) => string;
	onOpen: (record: Row) => void;
	children?: ReactNode;
}) {
	const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
	return (
		<>
			{children}
			<div className="max-w-sm">
				<InputField
					name="search"
					label={m.search()}
					value={search}
					maxLength={limits.title}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</div>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending ? (
				<p role="status">{m.loading()}</p>
			) : rows.length ? (
				<CollectionTable
					rows={rows}
					columns={columns}
					rowKey={rowKey}
					onOpen={onOpen}
				/>
			) : !query.isError ? (
				<p>{m.empty()}</p>
			) : null}
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => void query.fetchNextPage()}
				>
					{query.isFetchingNextPage ? m.loading() : m.load_more()}
				</Button>
			)}
		</>
	);
}

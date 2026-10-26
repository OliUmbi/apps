import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";
import { useCollection } from "../../hooks/use-collection";
import type {
	CollectionNavigation,
	CollectionSource,
} from "../../model/collection";
import { DeleteConfirmation } from "../delete-confirmation";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Body } from "../ui/text";
import { CollectionList } from "./collection-list";
import type { ContentColumn } from "./collection-table";
import { type ContentEditor, ContentForm } from "./content-form";

// A collection is read-only, editable or creatable (D7). Without an input type
// only the read-only member exists, so read-only collections cannot spell an
// editor or its mutation pair at all.
type AnyCapability<Row, Input> =
	| ReadOnlyCapability<Row>
	| EditableCapability<Row, Input>
	| CreatableCapability<Row, Input>;

export type CollectionCapability<Row, Input> = [Input] extends [never]
	? ReadOnlyCapability<Row>
	: AnyCapability<Row, Input>;

export interface ReadOnlyCapability<Row> {
	mode: "read-only";
	renderDetails?: (record: Row) => ReactNode;
}

// `canEdit` and `renderDetails` travel together: a record the editor refuses
// must still render read-only, so the pair is all-or-nothing.
export interface ReadOnlyFallback<Row> {
	canEdit: (record: Row) => boolean;
	renderDetails: (record: Row) => ReactNode;
}

export interface EditableCapability<Row, Input> {
	mode: "editable";
	editor: ContentEditor<Row, Input>;
	update: (record: Row, values: Input) => Promise<Row>;
	fallback?: ReadOnlyFallback<Row>;
}

export interface CreatableCapability<Row, Input> {
	mode: "creatable";
	editor: ContentEditor<Row, Input>;
	create: (values: Input) => Promise<Row>;
	update: (record: Row, values: Input) => Promise<Row>;
	fallback?: ReadOnlyFallback<Row>;
}

export interface CollectionProps<Row, Input = never>
	extends CollectionSource<Row> {
	title: string;
	columns: readonly ContentColumn<Row>[];
	capability: CollectionCapability<Row, Input>;
	renderActions?: (record: Row) => ReactNode;
	renderRelated?: (record: Row) => ReactNode;
	introduction?: ReactNode;
}

// The adapters own the context around the collection: where the selection
// lives (URL search or local state) and which heading chrome frames it.
export interface CollectionFrame<Row> {
	navigation: CollectionNavigation<Row>;
	search: string;
	onSearchChange: (search: string) => void;
	renderHeader: (title: string, actions: ReactNode) => ReactNode;
}

export function Collection<Row, Input = never>({
	collection,
	scope,
	rowKey,
	loadPage,
	loadRecord,
	remove,
	title,
	columns,
	capability,
	renderActions,
	renderRelated,
	introduction,
	navigation,
	search,
	onSearchChange,
	renderHeader,
}: CollectionProps<Row, Input> & CollectionFrame<Row>) {
	// The capability collapses to read-only for `Input = never` callers; the
	// component itself works against the full union.
	const capabilitySet: AnyCapability<Row, Input> = capability;
	const create =
		capabilitySet.mode === "creatable" ? capabilitySet.create : undefined;
	const update =
		capabilitySet.mode === "read-only" ? undefined : capabilitySet.update;
	const renderDetails =
		capabilitySet.mode === "read-only"
			? capabilitySet.renderDetails
			: capabilitySet.fallback?.renderDetails;
	const {
		list: query,
		record,
		creating,
		save,
		saveRecord,
		conflict,
		reload,
		deletion,
		deleting,
		confirmDelete,
		editorVersion,
		inWorkspace,
		loadingRecord,
		recordError,
		recordMissing,
		close,
		open,
		startCreate,
		requestDelete,
		cancelDelete,
	} = useCollection<Row, Input>(
		{ collection, scope, rowKey, loadPage, loadRecord, create, update, remove },
		navigation,
		search,
	);
	const editing = capabilitySet.mode === "read-only" ? null : capabilitySet;
	const editable =
		editing !== null &&
		(creating ||
			(record !== null &&
				(editing.fallback ? editing.fallback.canEdit(record) : true)));
	const actions = inWorkspace ? (
		<Button variant="secondary" disabled={save.isPending} onClick={close}>
			{m.studio_back_to_collection()}
		</Button>
	) : capabilitySet.mode === "creatable" ? (
		<Button variant="primary" onClick={startCreate}>
			{m.create()}
		</Button>
	) : null;

	return (
		<section className="grid gap-6">
			{renderHeader(title, actions)}
			{inWorkspace ? (
				<>
					{loadingRecord && <p role="status">{m.loading()}</p>}
					<Alert>{recordError ? m.error_generic() : null}</Alert>
					{recordMissing && <p>{m.empty()}</p>}
					{editable && editing ? (
						<ContentForm
							key={`${record ? rowKey(record) : "new"}:${editorVersion}`}
							editor={editing.editor}
							record={record}
							pending={save.isPending}
							error={save.isError}
							conflict={conflict}
							saved={
								save.isSuccess &&
								record !== null &&
								rowKey(save.data) === rowKey(record)
							}
							onSave={saveRecord}
							onReload={reload}
							onClose={close}
						/>
					) : record ? (
						renderDetails?.(record)
					) : null}
					{record && (
						<>
							{renderActions?.(record)}
							{renderRelated?.(record)}
							<div className="flex items-center justify-between gap-6 pt-5">
								<Body>{m.confirm_delete_description()}</Body>
								<Button
									variant="danger"
									disabled={save.isPending}
									onClick={() => requestDelete(record)}
								>
									{m.delete_record()}
								</Button>
							</div>
						</>
					)}
				</>
			) : (
				<CollectionList
					query={query}
					search={search}
					onSearchChange={onSearchChange}
					columns={columns}
					rowKey={rowKey}
					onOpen={open}
				>
					{introduction}
				</CollectionList>
			)}
			{deleting && (
				<DeleteConfirmation
					pending={deletion.isPending}
					error={deletion.isError}
					onConfirm={confirmDelete}
					onClose={cancelDelete}
				/>
			)}
		</section>
	);
}

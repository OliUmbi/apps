import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import type { ReactNode } from "react";
import { useCollection } from "../../hooks/use-collection";
import type {
	CollectionNavigation,
	CollectionSource,
} from "../../model/collection";
import { DeleteConfirmation } from "../delete-confirmation";
import { CollectionList } from "./collection-list";
import type { ContentColumn } from "./collection-table";
import { type ContentEditor, ContentForm } from "./content-form";

export interface CollectionViewProps<Row, Input>
	extends CollectionSource<Row, Input> {
	title: string;
	columns: readonly ContentColumn<Row>[];
	editor?: ContentEditor<Row, Input>;
	canEdit?: (record: Row) => boolean;
	renderDetails?: (record: Row) => ReactNode;
	renderRelated?: (record: Row) => ReactNode;
	renderActions?: (record: Row) => ReactNode;
	introduction?: ReactNode;
}

export function CollectionView<Row, Input = never>({
	collection,
	title,
	scope,
	inline = false,
	navigation,
	search,
	onSearchChange,
	rowKey,
	loadPage,
	loadRecord,
	columns,
	editor,
	create,
	update,
	remove,
	canEdit = () => true,
	renderDetails,
	renderRelated,
	renderActions,
	introduction,
}: CollectionViewProps<Row, Input> & {
	inline?: boolean;
	navigation: CollectionNavigation<Row>;
	search: string;
	onSearchChange: (search: string) => void;
}) {
	const {
		list: query,
		record,
		creating,
		save,
		saveRecord,
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
	} = useCollection(
		{ collection, scope, rowKey, loadPage, loadRecord, create, update, remove },
		navigation,
		search,
	);
	const editable =
		editor &&
		(creating ? Boolean(create) : record && update && canEdit(record));

	return (
		<section
			className={inline ? "related-panel content-stack" : "content-stack"}
		>
			<header className="page-heading">
				{inline ? <h3>{title}</h3> : <h1>{title}</h1>}
				{inWorkspace ? (
					<Button className="button" disabled={save.isPending} onClick={close}>
						{m.studio_back_to_collection()}
					</Button>
				) : (
					create && (
						<Button className="button primary" onClick={startCreate}>
							{m.create()}
						</Button>
					)
				)}
			</header>
			{inWorkspace ? (
				<>
					{loadingRecord && <p role="status">{m.loading()}</p>}
					<FormFeedback error={recordError ? m.error_generic() : null} />
					{recordMissing && <p>{m.empty()}</p>}
					{editable && editor ? (
						<ContentForm
							key={`${record ? rowKey(record) : "new"}:${editorVersion}`}
							editor={editor}
							record={record}
							pending={save.isPending}
							error={save.isError}
							saved={
								save.isSuccess &&
								record !== null &&
								rowKey(save.data) === rowKey(record)
							}
							onSave={saveRecord}
							onClose={close}
						/>
					) : record ? (
						renderDetails?.(record)
					) : null}
					{record && (
						<>
							{renderActions?.(record)}
							{renderRelated?.(record)}
							<div className="record-danger-zone">
								<p>{m.confirm_delete_description()}</p>
								<Button
									className="button danger"
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

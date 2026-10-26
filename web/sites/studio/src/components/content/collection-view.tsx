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
import { PageHeader } from "../ui/page-header";
import { Body, Title } from "../ui/text";
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
	} = useCollection(
		{ collection, scope, rowKey, loadPage, loadRecord, create, update, remove },
		navigation,
		search,
	);
	const editable =
		editor &&
		(creating ? Boolean(create) : record && update && canEdit(record));
	const actions = inWorkspace ? (
		<Button variant="secondary" disabled={save.isPending} onClick={close}>
			{m.studio_back_to_collection()}
		</Button>
	) : (
		create && (
			<Button variant="primary" onClick={startCreate}>
				{m.create()}
			</Button>
		)
	);

	return (
		<section className="grid gap-6">
			{inline ? (
				<header className="flex items-center justify-between gap-4">
					<Title as="h3" size="sm">
						{title}
					</Title>
					<div className="flex flex-wrap gap-2">{actions}</div>
				</header>
			) : (
				<PageHeader title={title} actions={actions} />
			)}
			{inWorkspace ? (
				<>
					{loadingRecord && <p role="status">{m.loading()}</p>}
					<Alert>{recordError ? m.error_generic() : null}</Alert>
					{recordMissing && <p>{m.empty()}</p>}
					{editable && editor ? (
						<ContentForm
							key={`${record ? rowKey(record) : "new"}:${editorVersion}`}
							editor={editor}
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

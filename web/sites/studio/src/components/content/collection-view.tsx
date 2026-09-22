import { Button } from "@base-ui/react/button";
import { limits, type Page, type PageInput } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Route } from "../../routes/index";
import { DeleteConfirmation } from "../delete-confirmation";
import { InputField } from "../input-field";
import { CollectionTable, type ContentColumn } from "./collection-table";
import { type ContentEditor, ContentForm } from "./content-form";

interface CollectionViewProps<Row, Input> {
	collection: string;
	title: string;
	scope?: string;
	inline?: boolean;
	rowKey: (record: Row) => string;
	loadPage: (input: PageInput) => Promise<Page<Row>>;
	loadRecord?: (id: string) => Promise<Row | null>;
	columns: readonly ContentColumn<Row>[];
	editor?: ContentEditor<Row, Input>;
	create?: (values: Input) => Promise<Row>;
	update?: (record: Row, values: Input) => Promise<Row>;
	remove: (record: Row) => Promise<void>;
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
}: CollectionViewProps<Row, Input>) {
	const searchState = Route.useSearch();
	const navigate = Route.useNavigate();
	const cache = useQueryClient();
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<Row | null>(null);
	const [inlineCreating, setInlineCreating] = useState(false);
	const [deleting, setDeleting] = useState<Row | null>(null);
	const [editorVersion, setEditorVersion] = useState(0);
	const creating =
		Boolean(create) &&
		(inline ? inlineCreating : searchState.mode === "create");
	const recordId =
		!inline && searchState.mode === "detail" ? searchState.record : undefined;
	const collectionKey = ["content", collection];
	const query = useInfiniteQuery({
		queryKey: [...collectionKey, "list", scope, search],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			loadPage({ page: pageParam, size: limits.page, search }),
		getNextPageParam: (page) => page.nextPage,
	});
	const detail = useQuery({
		queryKey: [...collectionKey, "detail", recordId],
		queryFn: () => {
			if (!loadRecord || !recordId) throw new Error("A record is required");
			return loadRecord(recordId);
		},
		enabled: Boolean(recordId && loadRecord),
	});
	const record = inline ? selection : (detail.data ?? null);

	function close() {
		setSelection(null);
		setInlineCreating(false);
		if (!inline)
			void navigate({
				search: { ...searchState, mode: "list", record: undefined },
			});
	}

	function open(record: Row) {
		save.reset();
		if (inline) {
			setSelection(record);
			setInlineCreating(false);
		} else {
			void navigate({
				search: { ...searchState, mode: "detail", record: rowKey(record) },
			});
		}
	}

	const save = useMutation({
		mutationFn: ({ record, values }: { record: Row | null; values: Input }) => {
			if (record && update) return update(record, values);
			if (!record && create) return create(values);
			throw new Error("This record cannot be saved");
		},
		onSuccess: async (saved) => {
			cache.setQueryData([...collectionKey, "detail", rowKey(saved)], saved);
			await cache.invalidateQueries({ queryKey: collectionKey });
			setEditorVersion((version) => version + 1);
			if (inline) {
				setSelection(saved);
				setInlineCreating(false);
			} else {
				void navigate({
					search: { ...searchState, mode: "detail", record: rowKey(saved) },
				});
			}
		},
	});
	const deletion = useMutation({
		mutationFn: remove,
		onSuccess: async (_, removed) => {
			cache.removeQueries({
				queryKey: [...collectionKey, "detail", rowKey(removed)],
			});
			close();
			setDeleting(null);
			await cache.invalidateQueries({ queryKey: collectionKey });
		},
	});
	const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
	const inWorkspace = creating || record !== null || Boolean(recordId);
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
						<Button
							className="button primary"
							onClick={() => {
								save.reset();
								if (inline) setInlineCreating(true);
								else
									void navigate({
										search: {
											...searchState,
											mode: "create",
											record: undefined,
										},
									});
							}}
						>
							{m.create()}
						</Button>
					)
				)}
			</header>
			{inWorkspace ? (
				<>
					{recordId && detail.isPending && <p role="status">{m.loading()}</p>}
					<FormFeedback
						error={recordId && detail.isError ? m.error_generic() : null}
					/>
					{recordId && detail.isSuccess && !record && <p>{m.empty()}</p>}
					{editable && editor ? (
						<ContentForm
							key={`${record ? rowKey(record) : "new"}:${editorVersion}`}
							editor={editor}
							record={record}
							pending={save.isPending}
							error={save.isError}
							onSave={(values) => save.mutate({ record, values })}
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
									onClick={() => {
										deletion.reset();
										setDeleting(record);
									}}
								>
									{m.delete_record()}
								</Button>
							</div>
						</>
					)}
				</>
			) : (
				<>
					{introduction}
					<div className="max-w-sm">
						<InputField
							name="search"
							label={m.search()}
							value={search}
							maxLength={limits.title}
							onChange={(event) => setSearch(event.target.value)}
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
							onOpen={open}
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
			)}
			{deleting && (
				<DeleteConfirmation
					pending={deletion.isPending}
					error={deletion.isError}
					onConfirm={() => deletion.mutate(deleting)}
					onClose={() => setDeleting(null)}
				/>
			)}
		</section>
	);
}

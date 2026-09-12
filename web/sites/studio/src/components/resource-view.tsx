import { limits, type ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Route } from "../routes/index";
import {
	createRecord,
	deleteRecord,
	getRecord,
	listRecords,
	updateRecord,
} from "../server/resources.functions";
import { relationsFor } from "../studio/hierarchy";
import { getResource, type ResourceId } from "../studio/resources";
import { DeleteConfirmation } from "./delete-confirmation";
import { RecordDetail } from "./record-detail";
import { RecordEditor } from "./record-editor";
import { RelatedResources } from "./related-resources";
import { ResourceTable } from "./resource-table";
import { SubscriberActions } from "./subscriber-actions";
import { SubscriberInvite } from "./subscriber-invite";
import { Button, FormFeedback, InputField } from "./ui/index";

export function ResourceView({ resourceId }: { resourceId: ResourceId }) {
	const resource = getResource(resourceId);
	const relations = relationsFor(resourceId);
	const searchState = Route.useSearch();
	const navigate = Route.useNavigate();
	const cache = useQueryClient();
	const list = useServerFn(listRecords);
	const get = useServerFn(getRecord);
	const create = useServerFn(createRecord);
	const update = useServerFn(updateRecord);
	const remove = useServerFn(deleteRecord);
	const [search, setSearch] = useState("");
	const [deleting, setDeleting] = useState<ResourceRecord | null>(null);
	const key = ["records", resourceId];
	const recordId =
		searchState.mode === "detail" ? searchState.record : undefined;
	const creating = searchState.mode === "create";
	const query = useInfiniteQuery({
		queryKey: [...key, search],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({
				data: {
					resource: resourceId,
					page: pageParam,
					size: limits.page,
					search,
				},
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	const detail = useQuery({
		queryKey: ["record", resourceId, recordId],
		queryFn: () => get({ data: { resource: resourceId, id: recordId ?? "" } }),
		enabled: Boolean(recordId),
	});
	const editable = Boolean(
		resource.edit &&
			(!resource.editableWhen ||
				detail.data?.[resource.editableWhen.field] ===
					resource.editableWhen.value),
	);
	const closeWorkspace = () => {
		void navigate({
			search: { ...searchState, mode: "list", record: undefined },
		});
	};
	const openRecord = (record: ResourceRecord) => {
		const id = String(record.id ?? "");
		if (!id) return;
		void navigate({
			search: { ...searchState, mode: "detail", record: id },
		});
	};
	const save = useMutation({
		mutationFn: ({
			record,
			values,
		}: {
			record: ResourceRecord | null;
			values: ResourceRecord;
		}) =>
			record
				? update({ data: { resource: resourceId, key: record, values } })
				: create({ data: { resource: resourceId, values } }),
		onSuccess: async (saved) => {
			await cache.invalidateQueries({ queryKey: key });
			await cache.invalidateQueries({ queryKey: ["record", resourceId] });
			openRecord(saved as ResourceRecord);
		},
	});
	const deletion = useMutation({
		mutationFn: (record: ResourceRecord) =>
			remove({ data: { resource: resourceId, key: record } }),
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: key });
			setDeleting(null);
		},
	});

	if (creating)
		return (
			<div className="content-stack workspace-page">
				<WorkspaceBack onClick={closeWorkspace} />
				<RecordEditor
					resourceId={resourceId}
					record={null}
					onSave={(values) => save.mutate({ record: null, values })}
					onClose={closeWorkspace}
					pending={save.isPending}
					error={save.isError}
				/>
				{relations.length > 0 && (
					<p className="save-first-note">{m.studio_save_before_children()}</p>
				)}
			</div>
		);

	if (recordId)
		return (
			<div className="content-stack workspace-page">
				<WorkspaceBack onClick={closeWorkspace} />
				<FormFeedback error={detail.isError ? m.error_generic() : null} />
				{detail.isPending ? <p>{m.loading()}</p> : null}
				{detail.data ? (
					<>
						{editable ? (
							<RecordEditor
								key={recordId}
								resourceId={resourceId}
								record={detail.data}
								onSave={(values) =>
									save.mutate({ record: detail.data, values })
								}
								onClose={closeWorkspace}
								pending={save.isPending}
								error={save.isError}
							/>
						) : (
							<RecordDetail
								resourceId={resourceId}
								record={detail.data}
								onClose={closeWorkspace}
							/>
						)}
						{relations.length > 0 && (
							<RelatedResources parentId={recordId} relations={relations} />
						)}
						{resourceId === "zelglihof.subscriber" && (
							<SubscriberActions record={detail.data} />
						)}
					</>
				) : null}
			</div>
		);

	const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">
						{m.studio_components_resource_view_paragraph()}
					</p>
					<h1>{resource.label}</h1>
				</div>
				{resource.create && (
					<Button
						className="button primary"
						onClick={() => {
							save.reset();
							void navigate({
								search: {
									...searchState,
									mode: "create",
									record: undefined,
								},
							});
						}}
					>
						<Plus size={15} aria-hidden="true" />
						{m.create()}
					</Button>
				)}
			</header>
			{resourceId === "zelglihof.subscriber" && <SubscriberInvite />}
			<div className="max-w-sm">
				<InputField
					name="search"
					label={m.search()}
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
			</div>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending ? (
				<p role="status">{m.loading()}</p>
			) : rows.length ? (
				<ResourceTable
					resourceId={resourceId}
					rows={rows}
					onView={openRecord}
					onDelete={setDeleting}
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
			{deleting && (
				<DeleteConfirmation
					pending={deletion.isPending}
					error={deletion.isError}
					onConfirm={() => deletion.mutate(deleting)}
					onClose={() => setDeleting(null)}
				/>
			)}
		</div>
	);
}

function WorkspaceBack({ onClick }: { onClick: () => void }) {
	return (
		<Button className="workspace-back" onClick={onClick}>
			<ArrowLeft size={15} aria-hidden="true" />
			{m.studio_back_to_collection()}
		</Button>
	);
}

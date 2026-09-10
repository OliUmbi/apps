import { limits, type ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	createRecord,
	deleteRecord,
	listRecords,
	updateRecord,
} from "../server/resources.functions";
import { getResource, type ResourceId } from "../studio/resources";
import { DeleteConfirmation } from "./delete-confirmation";
import { RecordDetail } from "./record-detail";
import { RecordEditor } from "./record-editor";
import { ResourceTable } from "./resource-table";
import { SubscriberInvite } from "./subscriber-invite";
import { Button, FormFeedback, InputField } from "./ui/index";

export function ResourceView({ resourceId }: { resourceId: ResourceId }) {
	const resource = getResource(resourceId);
	const cache = useQueryClient();
	const list = useServerFn(listRecords),
		create = useServerFn(createRecord),
		update = useServerFn(updateRecord),
		remove = useServerFn(deleteRecord);
	const [viewing, setViewing] = useState<ResourceRecord | null>(null);
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<{
		record: ResourceRecord | null;
	} | null>(null);
	const [deleting, setDeleting] = useState<ResourceRecord | null>(null);
	const key = ["records", resourceId];
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
	const saved = async () => {
		await cache.invalidateQueries({ queryKey: key });
		setEditing(null);
		setDeleting(null);
	};
	const save = useMutation({
		mutationFn: (values: ResourceRecord) =>
			editing?.record
				? update({
						data: { resource: resourceId, key: editing.record, values },
					})
				: create({ data: { resource: resourceId, values } }),
		onSuccess: saved,
	});
	const deletion = useMutation({
		mutationFn: (key: ResourceRecord) =>
			remove({ data: { resource: resourceId, key } }),
		onSuccess: saved,
	});
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
							setEditing({ record: null });
						}}
					>
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
					onView={setViewing}
					onEdit={(record) => {
						save.reset();
						setEditing({ record });
					}}
					onDelete={(record) => {
						deletion.reset();
						setDeleting(record);
					}}
				/>
			) : !query.isError ? (
				<p>{m.empty()}</p>
			) : null}
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => {
						void query.fetchNextPage();
					}}
				>
					{query.isFetchingNextPage ? m.loading() : m.load_more()}
				</Button>
			)}
			{viewing && (
				<RecordDetail
					resourceId={resourceId}
					record={viewing}
					onClose={() => setViewing(null)}
				/>
			)}
			{editing && (
				<RecordEditor
					resourceId={resourceId}
					record={editing.record}
					onSave={(values) => save.mutate(values)}
					onClose={() => setEditing(null)}
					pending={save.isPending}
					error={save.isError}
				/>
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

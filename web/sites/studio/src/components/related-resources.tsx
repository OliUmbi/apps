import { limits, type ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
	createRecord,
	deleteRecord,
	listRelatedRecords,
	updateRecord,
} from "../server/resources.functions";
import type { ResourceRelation } from "../studio/hierarchy";
import { getResource } from "../studio/resources";
import { DeleteConfirmation } from "./delete-confirmation";
import { RecordDetail } from "./record-detail";
import { RecordEditor } from "./record-editor";
import { ResourceTable } from "./resource-table";
import { Button, FormFeedback } from "./ui/index";

export function RelatedResources({
	parentId,
	relations,
}: {
	parentId: string;
	relations: readonly ResourceRelation[];
}) {
	return (
		<section className="related-area">
			<header className="related-heading">
				<div>
					<p className="page-kicker">RELATIONS / LIVE</p>
					<h2>{m.studio_related_content()}</h2>
				</div>
				<span>{String(relations.length).padStart(2, "0")}</span>
			</header>
			<div className="related-grid">
				{relations.map((relation) => (
					<RelatedResource
						key={relation.resourceId}
						parentId={parentId}
						relation={relation}
					/>
				))}
			</div>
		</section>
	);
}

function RelatedResource({
	parentId,
	relation,
}: {
	parentId: string;
	relation: ResourceRelation;
}) {
	const resource = getResource(relation.resourceId);
	const cache = useQueryClient();
	const list = useServerFn(listRelatedRecords);
	const create = useServerFn(createRecord);
	const update = useServerFn(updateRecord);
	const remove = useServerFn(deleteRecord);
	const [editing, setEditing] = useState<ResourceRecord | null | undefined>();
	const [viewing, setViewing] = useState<ResourceRecord | null>(null);
	const [deleting, setDeleting] = useState<ResourceRecord | null>(null);
	const key = ["related-records", relation.resourceId, parentId];
	const query = useInfiniteQuery({
		queryKey: key,
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({
				data: {
					resource: relation.resourceId,
					field: relation.foreignKey,
					value: parentId,
					page: pageParam,
					size: limits.page,
					search: "",
				},
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	const saved = async () => {
		await cache.invalidateQueries({ queryKey: key });
		setEditing(undefined);
	};
	const save = useMutation({
		mutationFn: (values: ResourceRecord) =>
			editing
				? update({
						data: {
							resource: relation.resourceId,
							key: editing,
							values,
						},
					})
				: create({ data: { resource: relation.resourceId, values } }),
		onSuccess: saved,
	});
	const deletion = useMutation({
		mutationFn: (record: ResourceRecord) =>
			remove({ data: { resource: relation.resourceId, key: record } }),
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: key });
			setDeleting(null);
		},
	});
	const rows = query.data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<article className="related-panel">
			<header>
				<div>
					<h3>{resource.label}</h3>
					<p>{rows.length} Einträge in diesem Kontext</p>
				</div>
				{resource.create && editing === undefined && (
					<Button
						className="button"
						onClick={() => {
							save.reset();
							setEditing(null);
						}}
					>
						<Plus size={15} aria-hidden="true" />
						{m.create()}
					</Button>
				)}
			</header>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{editing !== undefined ? (
				<RecordEditor
					key={editing ? recordKey(editing) : "new"}
					resourceId={relation.resourceId}
					record={editing}
					fixedValues={{ [relation.foreignKey]: parentId }}
					variant="inline"
					onSave={(values) => save.mutate(values)}
					onClose={() => setEditing(undefined)}
					pending={save.isPending}
					error={save.isError}
				/>
			) : viewing ? (
				<RecordDetail
					resourceId={relation.resourceId}
					record={viewing}
					onClose={() => setViewing(null)}
					inline
				/>
			) : query.isPending ? (
				<p role="status">{m.loading()}</p>
			) : rows.length ? (
				<ResourceTable
					resourceId={relation.resourceId}
					rows={rows}
					onView={(record) => {
						if (
							resource.edit &&
							(!resource.editableWhen ||
								record[resource.editableWhen.field] ===
									resource.editableWhen.value)
						) {
							save.reset();
							setEditing(record);
						} else setViewing(record);
					}}
					onDelete={setDeleting}
				/>
			) : (
				<p className="related-empty">{m.empty()}</p>
			)}
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => void query.fetchNextPage()}
				>
					{m.load_more()}
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
		</article>
	);
}

function recordKey(record: ResourceRecord): string {
	return String(record.id);
}

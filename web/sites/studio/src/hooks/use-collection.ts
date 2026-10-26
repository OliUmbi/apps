import { limits, type Page } from "@oliumbi/contracts";
import { isConcurrentUpdateError as isJublawomaUpdateConflict } from "@oliumbi/jublawoma-data/content/errors";
import { isConcurrentUpdateError as isUncletUpdateConflict } from "@oliumbi/unclet-data/content/errors";
import { isConcurrentUpdateError as isZelglihofUpdateConflict } from "@oliumbi/zelglihof-data/content/errors";
import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import type {
	CollectionEditing,
	CollectionNavigation,
	CollectionSource,
} from "../model/collection";

// Each data package owns its update-conflict contract; the editor recognises
// all of them behind one reloadable conflict state. The server-function
// boundary keeps only Error.message, so recognition is message-based.
function isUpdateConflict(error: unknown): boolean {
	return (
		isJublawomaUpdateConflict(error) ||
		isUncletUpdateConflict(error) ||
		isZelglihofUpdateConflict(error)
	);
}

export function useCollection<Row, Input>(
	{
		collection,
		scope,
		rowKey,
		loadPage,
		loadRecord,
		create,
		update,
		remove,
	}: CollectionSource<Row> & CollectionEditing<Row, Input>,
	navigation: CollectionNavigation<Row>,
	search: string,
) {
	const cache = useQueryClient();
	const [deleting, setDeleting] = useState<Row | null>(null);
	const [editorVersion, setEditorVersion] = useState(0);
	const { selection } = navigation;
	const recordId = selection.mode === "detail" ? selection.id : undefined;
	const selectedRecord =
		selection.mode === "detail" ? selection.record : undefined;
	const collectionKey = ["content", collection];
	const list = useInfiniteQuery({
		queryKey: [...collectionKey, "list", scope, search],
		enabled: selection.mode === "list",
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
		enabled: Boolean(recordId && loadRecord && !selectedRecord),
	});
	const record = recordId ? (selectedRecord ?? detail.data ?? null) : null;
	const creating = Boolean(create) && selection.mode === "create";
	const save = useMutation({
		mutationFn: ({ record, values }: { record: Row | null; values: Input }) => {
			if (record && update) return update(record, values);
			if (!record && create) return create(values);
			throw new Error("This record cannot be saved");
		},
		onSuccess: async (saved) => {
			cache.setQueryData([...collectionKey, "detail", rowKey(saved)], saved);
			await cache.invalidateQueries({ queryKey: collectionKey });
		},
	});
	const deletion = useMutation({
		mutationFn: remove,
		onSuccess: async (_, removed) => {
			cache.removeQueries({
				queryKey: [...collectionKey, "detail", rowKey(removed)],
			});
			await cache.invalidateQueries({ queryKey: collectionKey });
		},
	});
	return {
		list,
		record,
		creating,
		save,
		saveRecord: (values: Input) =>
			save.mutate(
				{ record, values },
				{
					onSuccess: (saved) => {
						setEditorVersion((version) => version + 1);
						navigation.showRecord(saved);
					},
				},
			),
		conflict: save.isError && isUpdateConflict(save.error),
		reload: async () => {
			// Reload the record behind the editor and remount it, so the fields
			// show the row that was actually saved instead of the stale copy.
			save.reset();
			if (recordId && loadRecord) {
				await cache.fetchQuery({
					queryKey: [...collectionKey, "detail", recordId],
					queryFn: () => loadRecord(recordId),
				});
			} else if (recordId) {
				// Without loadRecord the row snapshot lives in the selection;
				// refresh it from the re-fetched list instead.
				await cache.invalidateQueries({ queryKey: collectionKey });
				const fresh = cache
					.getQueryData<InfiniteData<Page<Row>>>([
						...collectionKey,
						"list",
						scope,
						search,
					])
					?.pages.flatMap((page) => page.items)
					.find((row) => rowKey(row) === recordId);
				if (fresh) navigation.showRecord(fresh);
			}
			setEditorVersion((version) => version + 1);
		},
		deletion,
		deleting,
		confirmDelete: () => {
			if (!deleting) return;
			deletion.mutate(deleting, {
				onSuccess: () => {
					setDeleting(null);
					navigation.showList();
				},
			});
		},
		editorVersion,
		inWorkspace: creating || Boolean(recordId),
		loadingRecord: Boolean(recordId && !selectedRecord && detail.isPending),
		recordError: Boolean(recordId && !selectedRecord && detail.isError),
		recordMissing: Boolean(
			recordId && !selectedRecord && detail.isSuccess && !record,
		),
		close: navigation.showList,
		open: navigation.showRecord,
		startCreate: navigation.showCreate,
		requestDelete: (record: Row) => {
			deletion.reset();
			setDeleting(record);
		},
		cancelDelete: () => setDeleting(null),
	};
}

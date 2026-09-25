import { Button } from "@base-ui/react/button";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	deleteAsset,
	listAssets,
	setAssetVisibility,
} from "../server/assets.functions";
import { AssetCard } from "./assets/asset-card";
import { AssetUploadForm } from "./assets/asset-upload-form";
import { DeleteConfirmation } from "./delete-confirmation";

export function AssetsView({
	site,
	kind,
}: {
	site: SiteId;
	kind: "images" | "documents";
}) {
	const cache = useQueryClient();
	const list = useServerFn(listAssets);
	const visibility = useServerFn(setAssetVisibility);
	const remove = useServerFn(deleteAsset);
	const [deleting, setDeleting] = useState<string | null>(null);
	const key = ["assets", site, kind];
	const refresh = () => cache.invalidateQueries({ queryKey: key });
	const query = useInfiniteQuery({
		queryKey: key,
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({ data: { site, kind, page: pageParam, size: 30, search: "" } }),
		getNextPageParam: (page) => page.nextPage,
	});
	const toggle = useMutation({ mutationFn: visibility, onSuccess: refresh });
	const deletion = useMutation({
		mutationFn: (id: string) => remove({ data: { site, kind, id } }),
		onSuccess: async () => {
			await refresh();
			setDeleting(null);
		},
	});
	return (
		<div className="content-stack">
			<header className="page-heading">
				<h1>{kind === "images" ? "Bilder" : "Dokumente"}</h1>
			</header>
			<AssetUploadForm site={site} kind={kind} onUploaded={refresh} />
			<FormFeedback
				error={query.isError || toggle.isError ? m.error_generic() : null}
			/>
			{query.isPending ? <p>{m.loading()}</p> : null}
			<div className="grid gap-3">
				{query.data?.pages
					.flatMap((page) => page.items)
					.map((asset) => (
						<AssetCard
							key={asset.id}
							asset={asset}
							site={site}
							kind={kind}
							visibilityPending={toggle.isPending}
							onToggleVisibility={() =>
								toggle.mutate({
									data: { site, kind, id: asset.id, visible: !asset.visible },
								})
							}
							onDelete={() => {
								deletion.reset();
								setDeleting(asset.id);
							}}
						/>
					))}
			</div>
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => {
						void query.fetchNextPage();
					}}
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
		</div>
	);
}

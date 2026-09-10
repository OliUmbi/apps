import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
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
	uploadAsset,
} from "../server/assets.functions";
import { DeleteConfirmation } from "./delete-confirmation";
import { Button, Form, FormFeedback, InputField } from "./ui/index";
export function AssetsView({
	site,
	kind,
}: {
	site: SiteId;
	kind: "images" | "documents";
}) {
	const cache = useQueryClient();
	const list = useServerFn(listAssets),
		visibility = useServerFn(setAssetVisibility),
		remove = useServerFn(deleteAsset),
		upload = useServerFn(uploadAsset);
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
	const creation = useMutation({ mutationFn: upload, onSuccess: refresh });
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
			<Form
				className="panel grid gap-4 p-6"
				onSubmit={(event) => {
					event.preventDefault();
					const data = new FormData(event.currentTarget);
					data.set("site", site);
					data.set("kind", kind);
					data.set("visible", "false");
					creation.mutate({ data });
				}}
			>
				<InputField
					name="file"
					label={m.studio_components_assets_view_label()}
					type="file"
					accept={
						kind === "images"
							? "image/jpeg,image/png,image/webp"
							: "application/pdf"
					}
					required
				/>
				{kind === "documents" && (
					<InputField
						name="slug"
						label={m.studio_components_assets_view_label_2()}
						required
						pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
					/>
				)}
				<p className="text-sm text-zinc-400">
					{m.studio_components_assets_view_paragraph()}
				</p>
				<Button
					type="submit"
					disabled={creation.isPending}
					className="button primary"
				>
					{m.studio_components_assets_view_text()}
				</Button>
				<FormFeedback
					error={creation.isError ? m.error_generic() : null}
					success={
						creation.isSuccess
							? m.studio_components_assets_view_feedback()
							: null
					}
				/>
			</Form>
			<FormFeedback
				error={query.isError || toggle.isError ? m.error_generic() : null}
			/>
			{query.isPending ? <p>{m.loading()}</p> : null}
			<div className="grid gap-3">
				{query.data?.pages
					.flatMap((page) => page.items)
					.map((asset) => (
						<article
							key={asset.id}
							className="panel flex flex-wrap items-center justify-between gap-4 p-4"
						>
							<div>
								{kind === "images" && (
									<img
										src={`/api/assets/${asset.id}?site=${site}`}
										alt=""
										loading="lazy"
										className="mb-3 h-32 w-48 rounded object-cover"
									/>
								)}
								{"filename" in asset ? (
									<a
										className="underline"
										href={`/api/assets/${asset.id}?site=${site}&kind=documents`}
										target="_blank"
										rel="noopener"
									>
										{String(asset.filename)}
									</a>
								) : (
									<p>{asset.id}</p>
								)}
								<p className="text-sm text-zinc-400">
									{asset.visible
										? m.studio_components_assets_view_feedback_2()
										: "Privat"}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									className="button"
									disabled={toggle.isPending}
									onClick={() =>
										toggle.mutate({
											data: {
												site,
												kind,
												id: asset.id,
												visible: !asset.visible,
											},
										})
									}
								>
									{asset.visible
										? "Verbergen"
										: m.studio_components_assets_view_feedback_3()}
								</Button>
								<Button
									className="button danger"
									onClick={() => setDeleting(asset.id)}
								>
									{m.delete_record()}
								</Button>
							</div>
						</article>
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

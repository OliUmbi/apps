import { Button } from "@base-ui/react/button";
import type { AssetDocument, AssetImage } from "@oliumbi/assets";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";

export function AssetCard({
	asset,
	site,
	kind,
	visibilityPending,
	onToggleVisibility,
	onDelete,
}: {
	asset: AssetImage | AssetDocument;
	site: SiteId;
	kind: "images" | "documents";
	visibilityPending: boolean;
	onToggleVisibility: () => void;
	onDelete: () => void;
}) {
	return (
		<article className="panel flex flex-wrap items-center justify-between gap-4 p-4">
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
						{asset.filename}
					</a>
				) : (
					<p>{asset.id}</p>
				)}
				<p className="text-sm text-zinc-400">
					{asset.visible ? m.visibility_public() : m.studio_asset_private()}
				</p>
			</div>
			<div className="flex gap-2">
				<Button
					className="button"
					disabled={visibilityPending}
					onClick={onToggleVisibility}
				>
					{asset.visible ? m.studio_asset_hide() : m.publish()}
				</Button>
				<Button className="button danger" onClick={onDelete}>
					{m.delete_record()}
				</Button>
			</div>
		</article>
	);
}

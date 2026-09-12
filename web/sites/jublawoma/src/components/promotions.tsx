import { imageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { safeLinkHref } from "@oliumbi/ui/simple-markdown";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { listPublicRecords } from "../content/public.functions";
import { AssetImage } from "./ui/asset-image";
export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () =>
			listPublicRecords({ data: { resource: "jublawoma.promotion", page: 0 } }),
	});
	if (!query.data?.items.length) return null;
	const assetBase =
		import.meta.env.VITE_ASSETS_PUBLIC_URL ?? "http://localhost:8083";
	return (
		<div className="shell promotion-list">
			{query.data?.items.map((item: ResourceRecord) => (
				<a
					key={String(item.id)}
					href={safeLinkHref(String(item.link))}
					className="promotion-card group"
				>
					<div className="promotion-image">
						<AssetImage
							src={
								item.image_id
									? imageUrl(assetBase, String(item.image_id))
									: null
							}
							alt={String(item.title)}
							sizes="(min-width: 850px) 38vw, 100vw"
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="promotion-copy">
						<p className="kicker">{m.jublawoma_promotion_eyebrow()}</p>
						<h2 className="text-2xl font-bold">{item.title}</h2>
						<p className="mt-2 text-bark/70">{item.description}</p>
						<span className="promotion-link">
							{m.jublawoma_promotion_link()}{" "}
							<ArrowUpRight size={18} aria-hidden="true" />
						</span>
					</div>
				</a>
			))}
		</div>
	);
}

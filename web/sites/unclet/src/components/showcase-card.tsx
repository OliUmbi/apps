import { imageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { AssetImage } from "./ui/asset-image";
export function ShowcaseCard({ item }: { item: ResourceRecord }) {
	return (
		<Link
			to="/showcases/$slug"
			params={{ slug: String(item.slug) }}
			className="group"
		>
			<div className="image-treatment aspect-[4/3]">
				<AssetImage
					src={
						item.image_id
							? imageUrl(
									import.meta.env.VITE_ASSETS_PUBLIC_URL ??
										"http://localhost:8083",
									String(item.image_id),
								)
							: null
					}
					alt={String(item.title)}
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="border-b border-bone/15 py-5">
				<h2 className="font-serif text-2xl">{item.title}</h2>
				<p className="mt-2 text-sm text-bone/50">
					{item.location} · {item.guest_count}
					{m.unclet_components_showcase_card_paragraph()}
				</p>
			</div>
		</Link>
	);
}

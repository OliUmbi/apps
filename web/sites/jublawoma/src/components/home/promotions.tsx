import { publicImageUrl } from "@oliumbi/assets/urls";
import { safeLinkHref } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { getPromotions } from "../../data/promotions";
import { AssetImage } from "../asset-image";

export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () => getPromotions(),
	});
	if (!query.data?.items.length) return null;
	return (
		<div className="shell promotion-list">
			{query.data?.items.map((item) => (
				<a
					key={item.id}
					href={safeLinkHref(item.link)}
					className="promotion-card group"
				>
					<div className="promotion-image">
						<AssetImage
							src={item.imageId ? publicImageUrl(item.imageId) : null}
							alt={item.title}
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

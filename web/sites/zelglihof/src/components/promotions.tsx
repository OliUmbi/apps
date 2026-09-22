import { safeLinkHref } from "@oliumbi/contracts";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { getPromotions } from "../data/promotions";

export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () => getPromotions(),
	});
	if (!query.data?.items.length) return null;
	return (
		<div className="shell grid gap-4 py-6">
			{query.data?.items.map((item) => (
				<a
					key={item.id}
					href={safeLinkHref(item.link)}
					className="grid gap-4 rounded-3xl bg-sage/40 p-8 sm:grid-cols-[1fr_auto]"
				>
					<div>
						<h2 className="font-serif text-3xl">{item.title}</h2>
						<p className="mt-3 text-ink/65">{item.description}</p>
					</div>
					<ArrowUpRight className="self-center" size={30} aria-hidden="true" />
				</a>
			))}
		</div>
	);
}

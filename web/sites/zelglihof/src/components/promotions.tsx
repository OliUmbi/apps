import type { ResourceRecord } from "@oliumbi/contracts";
import { safeLinkHref } from "@oliumbi/ui/simple-markdown";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { listPublicRecords } from "../content/public.functions";
export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () =>
			listPublicRecords({ data: { resource: "zelglihof.promotion", page: 0 } }),
	});
	if (!query.data?.items.length) return null;
	return (
		<div className="shell grid gap-4 py-6">
			{query.data?.items.map((item: ResourceRecord) => (
				<a
					key={String(item.id)}
					href={safeLinkHref(String(item.link))}
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

import { useQuery } from "@tanstack/react-query";
import { listPublicRecords } from "../content/public.functions";
export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () =>
			listPublicRecords({ data: { resource: "jublawoma.promotion", page: 0 } }),
	});
	if (!query.data?.items.length) return null;
	return (
		<div className="shell grid gap-4 py-6">
			{query.data?.items.map((item) => (
				<a
					key={String(item.id)}
					href={String(item.link)}
					className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-bark/15 bg-sage/30 p-6"
				>
					<div>
						<h2 className="text-2xl font-bold">{item.title}</h2>
						<p className="mt-2 text-bark/70">{item.description}</p>
					</div>
					<span className="text-3xl" aria-hidden="true">
						↗
					</span>
				</a>
			))}
		</div>
	);
}

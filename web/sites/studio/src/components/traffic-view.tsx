import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTraffic } from "../server/traffic.functions";
import { Alert } from "./ui/alert";
import { PageHeader } from "./ui/page-header";
import { Body, Title } from "./ui/text";

export function TrafficView({ site }: { site: SiteId }) {
	const list = useServerFn(listTraffic);
	const query = useQuery({
		queryKey: ["traffic", site],
		queryFn: () => list({ data: { site } }),
	});
	const summary = query.data;
	return (
		<div className="grid gap-6">
			<PageHeader kicker="SITE / TRAFFIC" title={m.studio_traffic()} />
			<Body>{m.studio_traffic_description()}</Body>
			<Alert>{query.isError ? m.error_generic() : null}</Alert>
			{query.isPending && <p>{m.loading()}</p>}
			{summary && summary.total === 0 && <p>{m.studio_traffic_empty()}</p>}
			{summary && summary.total > 0 && (
				<>
					<p>{m.studio_traffic_total({ total: summary.total })}</p>
					<section className="grid gap-3">
						<Title as="h2" size="sm">
							{m.studio_traffic_top()}
						</Title>
						<table className="w-full text-left text-sm">
							<thead className="text-ink/55">
								<tr>
									<th className="py-1 font-normal">Route</th>
									<th className="py-1 text-right font-normal">
										{m.studio_traffic_views()}
									</th>
								</tr>
							</thead>
							<tbody>
								{summary.routes.map((row) => (
									<tr key={row.route} className="border-t border-ink/10">
										<td className="py-1.5 font-mono">{row.route}</td>
										<td className="py-1.5 text-right">{row.views}</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
					<section className="grid gap-3">
						<Title as="h2" size="sm">
							{m.studio_traffic_day()}
						</Title>
						<table className="w-full text-left text-sm">
							<tbody>
								{summary.days.map((row) => (
									<tr key={row.day} className="border-t border-ink/10">
										<td className="py-1.5">{row.day}</td>
										<td className="py-1.5 text-right">{row.views}</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				</>
			)}
		</div>
	);
}

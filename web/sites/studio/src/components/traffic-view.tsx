import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTraffic } from "../server/traffic.functions";
import { Alert } from "./ui/alert";
import { PageHeader } from "./ui/page-header";
import { Panel } from "./ui/panel";
import { Body } from "./ui/text";

const cellClass = "border-t border-line-subtle px-4 py-3";

export function TrafficView({ site }: { site: SiteId }) {
	const list = useServerFn(listTraffic);
	const query = useQuery({
		queryKey: ["traffic", site],
		queryFn: () => list({ data: { site } }),
	});
	const summary = query.data;
	return (
		<div className="grid gap-6">
			<PageHeader
				kicker={m.studio_traffic_kicker()}
				title={m.studio_traffic()}
				description={m.studio_traffic_description()}
			/>
			<Alert>{query.isError ? m.error_generic() : null}</Alert>
			{query.isPending && <p role="status">{m.loading()}</p>}
			{summary && summary.total === 0 && (
				<Body>{m.studio_traffic_empty()}</Body>
			)}
			{summary && summary.total > 0 && (
				<>
					<Body>{m.studio_traffic_total({ total: summary.total })}</Body>
					<div className="grid items-start gap-6 xl:grid-cols-2">
						<Panel title={m.studio_traffic_top()}>
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="font-mono text-xs text-fg-faint">
										<tr>
											<th
												scope="col"
												className="px-4 pb-3 text-left font-normal"
											>
												{m.studio_traffic_route()}
											</th>
											<th
												scope="col"
												className="px-4 pb-3 text-right font-normal"
											>
												{m.studio_traffic_views()}
											</th>
										</tr>
									</thead>
									<tbody>
										{summary.routes.map((row) => (
											<tr key={row.route}>
												<th
													scope="row"
													className={`${cellClass} font-mono font-normal`}
												>
													{row.route}
												</th>
												<td className={`${cellClass} text-right tabular-nums`}>
													{row.views}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Panel>
						<Panel title={m.studio_traffic_day()}>
							<table className="w-full text-left text-sm">
								<thead className="sr-only">
									<tr>
										<th scope="col">{m.studio_traffic_day()}</th>
										<th scope="col">{m.studio_traffic_views()}</th>
									</tr>
								</thead>
								<tbody>
									{summary.days.map((row) => (
										<tr key={row.day}>
											<th scope="row" className={`${cellClass} font-normal`}>
												{row.day}
											</th>
											<td className={`${cellClass} text-right tabular-nums`}>
												{row.views}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</Panel>
					</div>
				</>
			)}
		</div>
	);
}

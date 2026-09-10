import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { ShowcaseCard } from "../components/showcase-card";
import { PaginatedList } from "../components/ui/paginated-list";
import { listPublicRecords } from "../content/public.functions";

export const Route = createFileRoute("/showcases")({
	head: () => ({ meta: [{ title: m.unclet_routes_showcases_title() }] }),
	loader: () =>
		listPublicRecords({ data: { resource: "unclet.showcase", page: 0 } }),
	component: InsightsPage,
});

function InsightsPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_routes_showcases_eyebrow()}
				title={
					<>
						{m.unclet_routes_showcases_text()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_routes_showcases_text_2()}
						</span>
					</>
				}
				intro={m.unclet_routes_showcases_intro()}
			/>
			<section className="shell py-20 md:py-28">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<PaginatedList
						queryKey={["showcases"]}
						initialPage={Route.useLoaderData()}
						load={(page) =>
							listPublicRecords({ data: { resource: "unclet.showcase", page } })
						}
					>
						{(items) => (
							<>
								{items.map((item) => (
									<ShowcaseCard key={String(item.id)} item={item} />
								))}
							</>
						)}
					</PaginatedList>
				</div>
				<div className="mt-20 border border-brass/35 p-8 md:flex md:items-center md:justify-between md:p-12">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_routes_showcases_paragraph()}
						</p>
						<h2 className="display-title mt-4 text-4xl md:text-5xl">
							{m.unclet_routes_showcases_heading()}
						</h2>
					</div>
					<Link to="/inquiry" className="button-primary mt-8 md:mt-0">
						{m.unclet_routes_showcases_text_3()}
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}

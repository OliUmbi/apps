import { m } from "@oliumbi/i18n/messages";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { ShowcaseCard } from "../components/showcase-card";
import { getShowcasePage } from "../data/showcases";

export const Route = createFileRoute("/showcases/")({
	head: () => ({ meta: [{ title: m.unclet_showcases_page_title() }] }),
	loader: () =>
		getShowcasePage({
			data: { page: 0 },
		}),
	component: ShowcasesPage,
});

function ShowcasesPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_showcases_eyebrow()}
				title={
					<>
						{m.unclet_showcases_title()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_showcases_title_accent()}
						</span>
					</>
				}
				description={m.unclet_showcases_description()}
			/>
			<section className="shell py-20 md:py-28">
				<div className="grid gap-16 md:gap-24">
					<PaginatedList
						queryKey={["showcases"]}
						initialPage={Route.useLoaderData()}
						load={(page) =>
							getShowcasePage({
								data: { page },
							})
						}
					>
						{(items) => (
							<>
								{items.map((item, index) => (
									<ShowcaseCard key={item.id} showcase={item} index={index} />
								))}
							</>
						)}
					</PaginatedList>
				</div>
				<div className="mt-20 border border-brass/35 p-8 md:flex md:items-center md:justify-between md:p-12">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_showcases_inquiry_eyebrow()}
						</p>
						<h2 className="display-title mt-4 text-4xl md:text-5xl">
							{m.unclet_showcases_inquiry_title()}
						</h2>
					</div>
					<Link to="/inquiry" className="button-primary mt-8 md:mt-0">
						{m.unclet_showcases_inquire()}
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}

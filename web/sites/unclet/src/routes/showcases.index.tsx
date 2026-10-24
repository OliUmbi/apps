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
			<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] py-20 md:py-28">
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
						<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
							{m.unclet_showcases_inquiry_eyebrow()}
						</p>
						<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-4 text-4xl md:text-5xl">
							{m.unclet_showcases_inquiry_title()}
						</h2>
					</div>
					<Link
						to="/inquiry"
						className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light mt-8 md:mt-0"
					>
						{m.unclet_showcases_inquire()}
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}

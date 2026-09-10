import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PaginatedList } from "../components/ui/paginated-list";
import { listPublicRecords } from "../content/public.functions";
export const Route = createFileRoute("/donations")({
	loader: () =>
		listPublicRecords({ data: { resource: "jublawoma.donation", page: 0 } }),
	component: Donations,
});
function Donations() {
	return (
		<>
			<header className="shell page-hero">
				<div>
					<p className="kicker">{m.jublawoma_routes_donations_paragraph()}</p>
					<h1>
						{m.jublawoma_routes_donations_heading()}
						<br />
						<span>{m.jublawoma_routes_donations_text()}</span>
					</h1>
					<p>{m.jublawoma_routes_donations_paragraph_2()}</p>
				</div>
				<img src="/assets/images/doodles/loving.svg" alt="" />
			</header>
			<PaginatedList
				queryKey={["donations"]}
				initialPage={Route.useLoaderData()}
				load={(page) =>
					listPublicRecords({ data: { resource: "jublawoma.donation", page } })
				}
			>
				{(items) => (
					<div className="shell grid gap-6 pb-16 md:grid-cols-2">
						{items.map((item) => (
							<Link
								to="/donations/$donationId"
								params={{ donationId: String(item.id) }}
								key={String(item.id)}
								className="rounded-3xl border border-current/15 p-8"
							>
								<h2 className="text-3xl">{item.title}</h2>
								<p className="mt-4">{item.description}</p>
								<p className="mt-6 font-bold">
									{m.jublawoma_routes_donations_paragraph_3()}
								</p>
							</Link>
						))}
					</div>
				)}
			</PaginatedList>
		</>
	);
}

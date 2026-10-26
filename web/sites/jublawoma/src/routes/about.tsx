import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PartnerOrganizations } from "../components/partner-organizations";
import { PublicMembers } from "../components/public-members";
import { getLeadership, getMemberPage } from "../data/members";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/about")({
	loader: async () => {
		const [leadership, memberPage] = await Promise.all([
			// The leadership block renders its own error branch for a null seed
			// (J-07); the member list is primary content, so its failure surfaces
			// as the route error with a retry.
			getLeadership().catch(() => null),
			getMemberPage({ data: { page: 0 } }),
		]);
		return { leadership, memberPage };
	},
	head: () =>
		pageHead({
			title: m.jublawoma_navigation_about(),
			description: m.jublawoma_about_description(),
		}),
	component: About,
});
function About() {
	const { leadership, memberPage } = Route.useLoaderData();
	return (
		<>
			<section className="page-hero shell">
				<div>
					<p className="kicker">{m.jublawoma_about_eyebrow()}</p>
					<h1>
						{m.jublawoma_about_title()}
						<br />
						<span className="font-serif font-normal italic text-moss">
							{m.jublawoma_about_title_accent()}
						</span>
					</h1>
					<p>{m.jublawoma_about_description()}</p>
				</div>
				<img
					className="photo"
					src="/assets/images/people/scharleitung.jpg"
					alt={m.jublawoma_about_leadership_alt()}
				/>
			</section>
			<section className="shell split-body">
				<h2>
					{m.jublawoma_about_training_title()}
					<br />
					{m.jublawoma_about_training_title_accent()}
				</h2>
				<div>
					<p>{m.jublawoma_about_training_body()}</p>
					<p>{m.jublawoma_about_inclusion_body()}</p>
				</div>
			</section>
			<PublicMembers leadership={leadership} memberPage={memberPage} />
			<PartnerOrganizations />
		</>
	);
}

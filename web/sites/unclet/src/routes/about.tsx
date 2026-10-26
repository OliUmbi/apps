import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ChefExperience } from "../components/about/chef-experience";
import { CookingPhilosophy } from "../components/about/cooking-philosophy";
import { PageHero } from "../components/page-hero";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/about")({
	head: () =>
		pageHead({
			title: m.unclet_about_page_title(),
			description: m.unclet_about_page_description(),
		}),
	component: AboutPage,
});

function AboutPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_chef_name()}
				title={
					<>
						{m.unclet_about_title()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_about_title_accent()}
						</span>
					</>
				}
				description={m.unclet_about_description()}
				image="/images/thomas.jpg"
			/>
			<CookingPhilosophy />
			<ChefExperience />
		</>
	);
}

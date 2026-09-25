import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ChefExperience } from "../components/about/chef-experience";
import { CookingPhilosophy } from "../components/about/cooking-philosophy";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: m.unclet_about_page_title() },
			{
				name: "description",
				content: m.unclet_about_page_description(),
			},
		],
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

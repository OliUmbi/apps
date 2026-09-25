import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "../components/page-hero";
import { CateringFormats } from "../components/services/catering-formats";
import { EventPlanning } from "../components/services/event-planning";

export const Route = createFileRoute("/services")({
	head: () => ({
		meta: [
			{ title: m.unclet_services_page_title() },
			{
				name: "description",
				content: m.unclet_services_page_description(),
			},
		],
	}),
	component: ServicesPage,
});

function ServicesPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_services_eyebrow()}
				title={
					<>
						{m.unclet_services_title()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_services_title_accent()}
						</span>
					</>
				}
				description={m.unclet_services_description()}
				image="/images/catering.jpg"
			/>
			<CateringFormats />
			<EventPlanning />
		</>
	);
}

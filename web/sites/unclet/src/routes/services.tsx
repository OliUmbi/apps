import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "../components/page-hero";
import { CateringFormats } from "../components/services/catering-formats";
import { EventPlanning } from "../components/services/event-planning";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/services")({
	head: () =>
		pageHead({
			title: m.unclet_services_page_title(),
			description: m.unclet_services_page_description(),
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

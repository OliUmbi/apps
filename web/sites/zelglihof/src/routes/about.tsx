import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { AnimalWelfare } from "../components/about/animal-welfare";
import { FarmFacts } from "../components/about/farm-facts";
import { FarmIntroduction } from "../components/about/farm-introduction";
import { SeasonalCrops } from "../components/about/seasonal-crops";
import { VisitFarm } from "../components/about/visit-farm";

export const Route = createFileRoute("/about")({
	head: () => ({ meta: [{ title: m.zelglihof_about_page_title() }] }),
	component: AboutPage,
});

function AboutPage() {
	return (
		<>
			<FarmIntroduction />
			<FarmFacts />
			<AnimalWelfare />
			<SeasonalCrops />
			<VisitFarm />
		</>
	);
}

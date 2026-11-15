import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { VisitFarm } from "../components/about/visit-farm";
import { CropMosaic } from "../components/crops/crop-mosaic";
import { CropsIntroduction } from "../components/crops/crops-introduction";
import { imagePreload } from "../components/static-image";

export const Route = createFileRoute("/crops")({
	head: () => ({
		meta: [{ title: m.zelglihof_crops_page_title() }],
		links: [imagePreload("zuckermais-mulchfeld", "100vw")],
	}),
	component: CropsPage,
});

function CropsPage() {
	return (
		<>
			<CropsIntroduction />
			<CropMosaic />
			<VisitFarm />
		</>
	);
}

import { localizeHref } from "@oliumbi/i18n/runtime";
import { Canonical, JsonLd, localBusinessJsonLd } from "@oliumbi/seo";
import { useRouterState } from "@tanstack/react-router";
import { siteOrigin } from "../model/seo";

export function SiteSeo() {
	// The router keeps canonical English route ids; the address bar is German.
	const path = useRouterState({ select: (state) => state.location.pathname });
	return (
		<>
			<Canonical origin={siteOrigin} path={localizeHref(path)} />
			<JsonLd
				data={localBusinessJsonLd({
					name: "Uncle-T GmbH",
					url: siteOrigin,
					street: "Zelgliweg 2",
					postalCode: "5506",
					city: "Mägenwil",
					email: "info@uncle-t.ch",
				})}
			/>
		</>
	);
}

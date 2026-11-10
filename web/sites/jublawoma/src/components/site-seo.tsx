import { localizeHref } from "@oliumbi/i18n/runtime";
import { Canonical, JsonLd, organizationJsonLd } from "@oliumbi/seo";
import { useRouterState } from "@tanstack/react-router";
import { siteOrigin } from "../model/seo";

export function SiteSeo() {
	const path = useRouterState({ select: (state) => state.location.pathname });
	return (
		<>
			<Canonical origin={siteOrigin} path={localizeHref(path)} />
			<JsonLd
				data={organizationJsonLd({ name: "Jubla Woma", url: siteOrigin })}
			/>
		</>
	);
}

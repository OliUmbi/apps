import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/*
 * One first-party beacon per resolved navigation: route id only, no cookie, no
 * identifier, no referrer. Bots and users without JS are not counted, which is
 * the intended trade: these are content sites, not funnels.
 *
 * The endpoint is the site's own /api/analytics/view handler.
 */
export function usePageView(endpoint = "/api/analytics/view") {
	const router = useRouter();
	const last = useRef<{ route: string; at: number } | null>(null);

	useEffect(() => {
		const send = () => {
			const matches = router.state.matches;
			const route = matches[matches.length - 1]?.routeId;
			if (!route) return;
			// The initial resolution can fire before and after hydration; one
			// navigation within a second is one view.
			const previous = last.current;
			if (
				previous &&
				previous.route === route &&
				Date.now() - previous.at < 1000
			)
				return;
			last.current = { route, at: Date.now() };
			void fetch(endpoint, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ route }),
				keepalive: true,
			}).catch(() => {
				// Analytics is never allowed to affect the page.
			});
		};
		const unsubscribe = router.subscribe("onResolved", send);
		send();
		return unsubscribe;
	}, [router, endpoint]);
}

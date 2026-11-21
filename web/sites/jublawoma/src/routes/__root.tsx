import { usePageView } from "@oliumbi/analytics";
import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
import { QueryProvider } from "@oliumbi/query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { NotFound } from "../components/not-found";
import { SiteSeo } from "../components/site-seo";
import { hasCurrentDonation } from "../data/donations";
import "../styles.css";

export const Route = createRootRoute({
	loader: async () => {
		// One cheap existence check decides whether the donations tab belongs in
		// the navigation. A failed check keeps the tab: hiding a real campaign is
		// worse than linking to an empty page.
		const hasDonations = await hasCurrentDonation().catch(() => true);
		return { hasDonations };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: m.jublawoma_site_title() },
			{
				name: "description",
				content: m.jublawoma_site_description(),
			},
			{
				property: "og:title",
				content: m.jublawoma_site_title(),
			},
			{
				property: "og:description",
				content: m.jublawoma_site_description(),
			},
			{ property: "og:type", content: "website" },
			{ name: "theme-color", content: "#ffffff" },
		],
		links: [{ rel: "icon", href: "/images/logos/favicon.ico" }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootComponent() {
	usePageView();
	const { hasDonations } = Route.useLoaderData();
	return (
		<QueryProvider>
			<SiteSeo />
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white"
				href="#main"
			>
				{m.skip_to_content()}
			</a>
			<Header hasDonations={hasDonations} />
			<main id="main" tabIndex={-1}>
				<Outlet />
			</main>
			<Footer />
		</QueryProvider>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang={getLocale()}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

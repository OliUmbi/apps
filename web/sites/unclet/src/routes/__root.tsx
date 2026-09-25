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
import Footer from "../components/footer";
import Header from "../components/header";
import { NotFound } from "../components/not-found";
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: m.unclet_site_title() },
			{
				name: "description",
				content: m.unclet_site_description(),
			},
			{
				property: "og:title",
				content: m.unclet_site_social_title(),
			},
			{
				property: "og:description",
				content: m.unclet_site_social_description(),
			},
			{ property: "og:type", content: "website" },
			{ name: "theme-color", content: "#11110f" },
		],
		links: [{ rel: "icon", href: "/favicon.ico" }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootComponent() {
	return (
		<QueryProvider>
			<Outlet />
		</QueryProvider>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang={getLocale()} className="h-full">
			<head>
				<HeadContent />
			</head>
			<body className="h-full">
				<Header />
				<main>{children}</main>
				<Footer />
				<Scripts />
			</body>
		</html>
	);
}

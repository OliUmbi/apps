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
import "../styles.css";

export const Route = createRootRoute({
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
			{ name: "theme-color", content: "#a63848" },
		],
		links: [{ rel: "icon", href: "/assets/images/logos/favicon.ico" }],
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
		<html lang={getLocale()}>
			<head>
				<HeadContent />
			</head>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
				<Scripts />
			</body>
		</html>
	);
}

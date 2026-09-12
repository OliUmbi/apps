import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import { NotFound } from "../components/not-found";
import { QueryProvider } from "../components/ui/index";
import "../styles/root.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: m.unclet_routes_root_content() },
			{ title: m.unclet_routes_root_title() },
			{
				name: "description",
				content: m.unclet_routes_root_content_2(),
			},
			{
				property: "og:title",
				content: m.unclet_routes_root_content_3(),
			},
			{
				property: "og:description",
				content: m.unclet_routes_root_content_4(),
			},
			{ property: "og:type", content: m.unclet_routes_root_content_5() },
			{ name: "theme-color", content: m.unclet_routes_root_content_6() },
		],
		links: [{ rel: "icon", href: "/favicon.ico" }],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
});

function RootComponent() {
	return (
		<RootDocument>
			<QueryProvider>
				<Outlet />
			</QueryProvider>
		</RootDocument>
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

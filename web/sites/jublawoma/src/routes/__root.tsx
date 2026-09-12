import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
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
import { QueryProvider } from "../components/ui/index";
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: m.jublawoma_routes_root_content() },
			{ title: m.jublawoma_routes_root_title() },
			{
				name: "description",
				content: m.jublawoma_routes_root_content_2(),
			},
			{
				property: "og:title",
				content: m.jublawoma_routes_root_title(),
			},
			{
				property: "og:description",
				content: m.jublawoma_routes_root_content_2(),
			},
			{ property: "og:type", content: "website" },
			{ name: "theme-color", content: m.jublawoma_routes_root_content_3() },
		],
		links: [{ rel: "icon", href: "/assets/images/logos/favicon.ico" }],
	}),
	component: () => (
		<Document>
			<QueryProvider>
				<Outlet />
			</QueryProvider>
		</Document>
	),
	notFoundComponent: NotFound,
});

function Document({ children }: Readonly<{ children: ReactNode }>) {
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

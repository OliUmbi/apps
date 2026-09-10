import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
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
	notFoundComponent: () => (
		<section className="shell not-found">
			<p className="kicker">404</p>
			<h1>{m.jublawoma_routes_root_heading()}</h1>
			<Link to="/" className="button dark">
				{m.jublawoma_routes_root_text()}
			</Link>
		</section>
	),
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

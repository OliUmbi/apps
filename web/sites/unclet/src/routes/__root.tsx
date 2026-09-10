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
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
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
	notFoundComponent: NotFoundComponent,
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

function NotFoundComponent() {
	return (
		<section className="shell grid min-h-[75vh] place-items-center pt-28 text-center">
			<div>
				<p className="eyebrow text-brass">{m.unclet_routes_root_paragraph()}</p>
				<h1 className="display-title mt-6 text-6xl md:text-8xl">
					{m.unclet_routes_root_heading()}
				</h1>
				<Link to="/" className="button-primary mt-10">
					{m.unclet_routes_root_text()}
				</Link>
			</div>
		</section>
	);
}

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
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: m.zelglihof_routes_root_content(),
			},
			{
				title: m.zelglihof_routes_root_title(),
			},
			{
				name: "description",
				content: m.zelglihof_routes_root_content_2(),
			},
			{ property: "og:title", content: m.zelglihof_routes_root_content_3() },
			{
				property: "og:description",
				content: m.zelglihof_routes_root_content_4(),
			},
			{ property: "og:type", content: m.zelglihof_routes_root_content_5() },
			{ name: "theme-color", content: m.zelglihof_routes_root_content_6() },
		],
		links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
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
		<section className="shell py-24 text-center">
			<p className="eyebrow text-clay">{m.zelglihof_routes_root_paragraph()}</p>
			<h1 className="display-title mx-auto mt-6 max-w-2xl text-6xl md:text-8xl">
				{m.zelglihof_routes_root_heading()}
			</h1>
			<p className="mx-auto mt-6 max-w-lg text-lg text-ink/60">
				{m.zelglihof_routes_root_paragraph_2()}
			</p>
			<Link to="/" className="button-primary mt-8">
				{m.zelglihof_routes_root_text()}
			</Link>
		</section>
	);
}

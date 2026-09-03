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
import "../styles/root.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Zelglihof Mägenwil · Direkt vom Hof",
			},
			{
				name: "description",
				content:
					"Mägenwiler Beef, frische Eier und saisonale Produkte direkt vom Familienbetrieb Habegger.",
			},
			{ property: "og:title", content: "Zelglihof Mägenwil · Direkt vom Hof" },
			{
				property: "og:description",
				content:
					"Fleisch aus eigener Mutterkuhhaltung, Hofladen und saisonale Produkte aus Mägenwil.",
			},
			{ property: "og:type", content: "website" },
			{ name: "theme-color", content: "#24452f" },
		],
		links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="de-CH" className="h-full">
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
			<p className="eyebrow text-clay">404 · Falscher Feldweg</p>
			<h1 className="display-title mx-auto mt-6 max-w-2xl text-6xl md:text-8xl">
				Hier wächst gerade nichts.
			</h1>
			<p className="mx-auto mt-6 max-w-lg text-lg text-ink/60">
				Die gesuchte Seite gibt es nicht oder sie wurde verschoben.
			</p>
			<Link to="/" className="button-primary mt-8">
				Zurück zum Hof
			</Link>
		</section>
	);
}

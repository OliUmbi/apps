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
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Uncle-T · Catering & Privatkoch aus Mägenwil" },
			{
				name: "description",
				content:
					"Massgeschneiderte kulinarische Erlebnisse von privaten Dinnern bis zu grossen Firmenanlässen – persönlich geplant von Thomas Habegger.",
			},
			{
				property: "og:title",
				content: "Uncle-T · Genuss, der zum Anlass passt",
			},
			{
				property: "og:description",
				content:
					"Catering und Private Dining aus Mägenwil für den Aargau und die Region.",
			},
			{ property: "og:type", content: "website" },
			{ name: "theme-color", content: "#11110f" },
		],
		links: [{ rel: "icon", href: "/favicon.ico" }],
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
		<section className="shell grid min-h-[75vh] place-items-center pt-28 text-center">
			<div>
				<p className="eyebrow text-brass">404 · Nicht auf der Karte</p>
				<h1 className="display-title mt-6 text-6xl md:text-8xl">
					Dieser Gang wird nicht serviert.
				</h1>
				<Link to="/" className="button-primary mt-10">
					Zur Startseite
				</Link>
			</div>
		</section>
	);
}

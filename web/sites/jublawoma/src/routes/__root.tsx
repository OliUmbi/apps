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
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Jubla Woma · Jungwacht Blauring Wohlenschwil Mägenwil" },
			{
				name: "description",
				content:
					"Gemeinschaft, Natur und Abenteuer für Kinder und Jugendliche aus Wohlenschwil, Mägenwil und Tägerig.",
			},
			{ name: "theme-color", content: "#a63848" },
		],
		links: [{ rel: "icon", href: "/assets/images/logos/favicon.ico" }],
	}),
	component: () => (
		<Document>
			<Outlet />
		</Document>
	),
	notFoundComponent: () => (
		<section className="shell not-found">
			<p className="kicker">404</p>
			<h1>Hier geht der Weg nicht weiter.</h1>
			<Link to="/" className="button dark">
				Zur Startseite
			</Link>
		</section>
	),
});

function Document({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="de-CH">
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

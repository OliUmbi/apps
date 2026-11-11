import { usePageView } from "@oliumbi/analytics";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NotFound } from "../components/not-found";
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Oliumbi" },
			{
				name: "description",
				content: "Oliumbi - personal site and experiments.",
			},
			{ name: "theme-color", content: "#f7f4ee" },
			{ property: "og:title", content: "Oliumbi" },
			{
				property: "og:description",
				content: "Oliumbi - personal site and experiments.",
			},
			{ property: "og:type", content: "website" },
		],
		links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootComponent() {
	usePageView();
	return <Outlet />;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" className="h-full">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-full">
				<main className="grid min-h-dvh place-items-center px-6 py-16">
					{children}
				</main>
				<Scripts />
			</body>
		</html>
	);
}

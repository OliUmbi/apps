import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import Navigation from "../components/navigation/navigation";
import rootCss from "../styles/root.css?url";

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
				title: "Zelglihof",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: rootCss,
			},
		],
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
			<body className="h-full bg-stone-50">
				<header className="flex gap-12 justify-between md:justify-center items-center md:p-8 p-4">
					<Link to="/">
						<span className="font-serif font-black text-3xl">Zelglihof</span>
					</Link>
					<Navigation />
				</header>
				<main className="h-full w-full">{children}</main>

				<Scripts />
			</body>
		</html>
	);
}

function NotFoundComponent() {
	return <h1>Not found</h1>;
}

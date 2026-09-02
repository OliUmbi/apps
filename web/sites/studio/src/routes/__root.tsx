import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Studio · Oliumbi" },
		],
	}),
	component: Root,
});

function Root() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

function Document({ children }: { children: ReactNode }) {
	return (
		<html lang="de" className="min-h-full">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-full">
				<main>{children}</main>
				<Scripts />
			</body>
		</html>
	);
}

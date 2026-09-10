import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { QueryProvider } from "../components/ui/index";
import "../styles.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: m.studio_routes_root_content() },
			{ title: m.studio_routes_root_title() },
		],
	}),
	component: Root,
});

function Root() {
	return (
		<Document>
			<QueryProvider>
				<Outlet />
			</QueryProvider>
		</Document>
	);
}

function Document({ children }: { children: ReactNode }) {
	return (
		<html lang={getLocale()} className="min-h-full">
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

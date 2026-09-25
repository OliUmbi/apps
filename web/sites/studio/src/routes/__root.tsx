import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
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
			{ title: m.studio_site_title() },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: Outlet,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang={getLocale()} className="min-h-full">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-full">
				{children}
				<Scripts />
			</body>
		</html>
	);
}

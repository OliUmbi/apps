import type { DatabasePool } from "@oliumbi/database";
import { sql } from "drizzle-orm";
import { viewDaily } from "./schema";

/*
 * Server-side aggregate counting. The client sends one route id per resolved
 * navigation; no cookie, identifier or address is stored. Route ids are
 * validated against the site's route tree, so an unknown value collapses into
 * "other" and the table cannot be grown with arbitrary keys.
 */

export type AnalyticsSite = "jublawoma" | "unclet" | "zelglihof";

export function routeIds(tree: unknown): string[] {
	const ids: string[] = [];
	const visit = (node: unknown) => {
		if (!node || typeof node !== "object") return;
		const record = node as { id?: unknown; children?: unknown };
		if (typeof record.id === "string") ids.push(record.id);
		if (record.children && typeof record.children === "object")
			for (const child of Object.values(record.children)) visit(child);
	};
	visit(tree);
	return ids;
}

export function normalizedRoute(
	route: string,
	allowed: readonly string[],
): string {
	return allowed.includes(route) ? route : "other";
}

export function createAnalytics(
	database: DatabasePool,
	site: AnalyticsSite,
	allowed: readonly string[],
) {
	return {
		async record(route: string): Promise<void> {
			await database.db
				.insert(viewDaily)
				.values({
					site,
					day: sql`current_date`,
					route: normalizedRoute(route, allowed),
					views: 1,
				})
				.onConflictDoUpdate({
					target: [viewDaily.site, viewDaily.day, viewDaily.route],
					set: { views: sql`${viewDaily.views} + 1` },
				});
		},
	};
}

export interface TrafficDay {
	day: string;
	views: number;
}

export interface TrafficRoute {
	route: string;
	views: number;
}

export interface TrafficSummary {
	total: number;
	days: TrafficDay[];
	routes: TrafficRoute[];
}

export async function trafficSummary(
	database: DatabasePool,
	site: string,
	days = 30,
): Promise<TrafficSummary> {
	const window = sql`${viewDaily.day} >= current_date - make_interval(days => ${days - 1})`;
	const dayRows = await database.db
		.select({
			day: viewDaily.day,
			views: sql<number>`sum(${viewDaily.views})::int`,
		})
		.from(viewDaily)
		.where(sql`${viewDaily.site} = ${site} and ${window}`)
		.groupBy(viewDaily.day)
		.orderBy(viewDaily.day);
	const routeRows = await database.db
		.select({
			route: viewDaily.route,
			views: sql<number>`sum(${viewDaily.views})::int`,
		})
		.from(viewDaily)
		.where(sql`${viewDaily.site} = ${site} and ${window}`)
		.groupBy(viewDaily.route)
		.orderBy(sql`sum(${viewDaily.views}) desc`)
		.limit(25);
	return {
		total: dayRows.reduce((sum, row) => sum + row.views, 0),
		days: dayRows,
		routes: routeRows,
	};
}

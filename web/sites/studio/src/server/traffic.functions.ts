import { trafficSummary } from "@oliumbi/analytics/server";
import { type SiteId, siteSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "./database.server";
import { studioAuthorization } from "./studio-authorization";

// Site-scoped: a site role sees its own numbers, studio.admin sees every site.
export const listTraffic = createServerFn({ method: "GET" })
	.middleware([studioAuthorization((data) => (data as { site: SiteId }).site)])
	.validator(z.object({ site: siteSchema }))
	.handler(async ({ data }) => {
		return trafficSummary(database, data.site, 30);
	});

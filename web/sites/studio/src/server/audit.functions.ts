import { siteIds } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listAuditEvents } from "./audit.server";
import { studioAuthorization } from "./studio-authorization";

// Admin-only by construction: studioAuthorization() without a site requires the
// cross-site role, so a site role cannot read the audit trail.
export const listAudit = createServerFn({ method: "GET" })
	.middleware([studioAuthorization()])
	.validator(z.object({ site: z.enum(siteIds).nullable() }))
	.handler(async ({ data }) => {
		return listAuditEvents({
			site: data.site ?? undefined,
			limit: 200,
		});
	});

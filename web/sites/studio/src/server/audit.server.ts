import type { SiteId } from "@oliumbi/contracts";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { auditEvent } from "./audit.schema";
import { database } from "./database.server";

/*
 * Audit is a record of intent, not a transaction log: the row is written after
 * the mutation committed, so a crash between the two can lose the entry. The
 * trade is deliberate - a failed audit write must never report a successful
 * mutation as failed. It is still the operator's view of destructive actions.
 */

export interface AuditActor {
	id: string;
	name: string;
}

export interface AuditEventInput {
	site?: SiteId | null;
	action: string;
	entity: string;
	entityId?: string | null;
	summary?: string | null;
}

export async function recordAudit(
	actor: AuditActor,
	event: AuditEventInput,
): Promise<void> {
	try {
		await database.transaction(async (transaction) => {
			await transaction.insert(auditEvent).values({
				site: event.site ?? null,
				actorId: actor.id,
				actorName: actor.name,
				action: event.action,
				entity: event.entity,
				entityId: event.entityId ?? null,
				summary: event.summary ?? null,
			});
		});
	} catch (error) {
		// The mutation already succeeded; surface the audit gap in the journal
		// without turning it into a user-facing failure.
		console.error("audit write failed", {
			action: event.action,
			entity: event.entity,
			entityId: event.entityId,
			error,
		});
	}
}

export interface AuditEventResponse {
	id: string;
	createdAt: string;
	site: string | null;
	actorName: string;
	action: string;
	entity: string;
	entityId: string | null;
	summary: string | null;
}

export async function listAuditEvents(filter: {
	site?: SiteId;
	limit: number;
}): Promise<AuditEventResponse[]> {
	const conditions: SQL[] = [];
	if (filter.site) conditions.push(eq(auditEvent.site, filter.site));
	const rows = await database.db
		.select({
			id: auditEvent.id,
			createdAt: auditEvent.createdAt,
			site: auditEvent.site,
			actorName: auditEvent.actorName,
			action: auditEvent.action,
			entity: auditEvent.entity,
			entityId: auditEvent.entityId,
			summary: auditEvent.summary,
		})
		.from(auditEvent)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(desc(auditEvent.createdAt))
		.limit(filter.limit);
	return rows;
}

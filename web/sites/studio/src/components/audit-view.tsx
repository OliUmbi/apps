import { type SiteId, siteIds } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	auditActionLabel,
	auditEntityLabel,
	auditSummaryLabel,
} from "../model/audit";
import { formatTimestamp } from "../model/dates";
import { listAudit } from "../server/audit.functions";
import { Alert } from "./ui/alert";
import { FilterChip } from "./ui/filter-chip";
import { ListMeta, ListShell, StaticListRow } from "./ui/list";
import { PageHeader } from "./ui/page-header";
import { Body, Title } from "./ui/text";

export function AuditView() {
	const list = useServerFn(listAudit);
	const [site, setSite] = useState<SiteId | null>(null);
	const query = useQuery({
		queryKey: ["audit", site],
		queryFn: () => list({ data: { site } }),
	});
	const events = query.data ?? [];
	return (
		<div className="grid gap-6">
			<PageHeader kicker={m.studio_audit_kicker()} title={m.studio_audit()} />
			<Body>{m.studio_audit_description()}</Body>
			<div className="flex flex-wrap gap-3">
				<FilterChip selected={site === null} onClick={() => setSite(null)}>
					{m.studio_audit_all_sites()}
				</FilterChip>
				{siteIds.map((id) => (
					<FilterChip
						key={id}
						selected={site === id}
						onClick={() => setSite(id)}
					>
						{id}
					</FilterChip>
				))}
			</div>
			{query.isError ? <Alert>{m.error_generic()}</Alert> : null}
			{query.isPending && <p role="status">{m.loading()}</p>}
			<ListShell>
				{events.map((event) => (
					<StaticListRow
						key={event.id}
						leading={<Body>{auditActionLabel(event.action)}</Body>}
						trailing={
							<ListMeta detail={formatTimestamp(event.createdAt)}>
								{event.site ?? "—"}
							</ListMeta>
						}
					>
						<Title as="h2" size="sm">
							{auditEntityLabel(event.entity)}
							{event.entityId ? ` · ${event.entityId.slice(0, 8)}` : null}
						</Title>
						<Body>
							{event.actorName}
							{event.summary
								? ` · ${auditSummaryLabel(event.summary) ?? event.summary}`
								: null}
						</Body>
					</StaticListRow>
				))}
			</ListShell>
			{events.length === 0 && query.isSuccess && (
				<p>{m.studio_audit_empty()}</p>
			)}
		</div>
	);
}

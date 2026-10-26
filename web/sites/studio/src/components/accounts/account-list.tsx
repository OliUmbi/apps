import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Plus } from "lucide-react";
import { listAccounts } from "../../server/accounts.functions";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, ListRow, ListShell } from "../ui/list";
import { PageHeader } from "../ui/page-header";
import { Body, Title } from "../ui/text";

export function AccountList({
	onCreate,
	onOpen,
}: {
	onCreate: () => void;
	onOpen: (id: string) => void;
}) {
	const list = useServerFn(listAccounts);
	const query = useQuery({ queryKey: ["accounts"], queryFn: () => list() });
	return (
		<div className="grid gap-6">
			<PageHeader
				kicker={m.studio_system()}
				title={m.studio_accounts()}
				description={m.studio_accounts_description()}
				actions={
					<Button variant="primary" onClick={onCreate}>
						<Plus size={16} /> {m.create()}
					</Button>
				}
			/>
			<Alert>{query.isError ? m.error_generic() : null}</Alert>
			{query.isPending && <p role="status">{m.loading()}</p>}
			{query.isSuccess && query.data.length === 0 && <p>{m.empty()}</p>}
			<ListShell>
				{query.data?.map((account) => (
					<ListRow
						key={account.id}
						leading={<Avatar>{account.name.slice(0, 1).toUpperCase()}</Avatar>}
						trailing={
							<>
								<Badge tone={account.enabled ? "neutral" : "danger"}>
									{account.enabled
										? m.studio_account_enabled()
										: m.studio_account_disabled()}
								</Badge>
								<ArrowUpRight size={18} aria-hidden="true" />
							</>
						}
						onClick={() => onOpen(account.id)}
					>
						<Title as="h2" size="sm">
							{account.name}
						</Title>
						<Body>{account.email}</Body>
					</ListRow>
				))}
			</ListShell>
		</div>
	);
}

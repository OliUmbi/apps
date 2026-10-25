import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PageHeader } from "../ui/page-header";
import { Body, Title } from "../ui/text";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Plus } from "lucide-react";
import { listAccounts } from "../../server/accounts.functions";

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
		<div className="grid gap-[22px]">
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
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p role="status">{m.loading()}</p>}
			{query.isSuccess && query.data.length === 0 && <p>{m.empty()}</p>}
			<div className="grid gap-px overflow-hidden rounded-[7px] border border-border-soft bg-border-soft">
				{query.data?.map((account) => (
					<button
						type="button"
						key={account.id}
						className="account-row cursor-pointer"
						onClick={() => onOpen(account.id)}
					>
						<div className="account-avatar">
							{account.name.slice(0, 1).toUpperCase()}
						</div>
						<div className="grid gap-1">
							<Title as="h2" size="sm">
								{account.name}
							</Title>
							<Body>{account.email}</Body>
						</div>
						<Badge tone={account.enabled ? "neutral" : "danger"}>
							{account.enabled
								? m.studio_account_enabled()
								: m.studio_account_disabled()}
						</Badge>
						<ArrowUpRight size={18} aria-hidden="true" />
					</button>
				))}
			</div>
		</div>
	);
}

import { Button } from "@base-ui/react/button";
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
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{m.studio_system()}</p>
					<h1>{m.studio_accounts()}</h1>
					<p>{m.studio_accounts_description()}</p>
				</div>
				<Button className="button primary" onClick={onCreate}>
					<Plus size={16} /> {m.create()}
				</Button>
			</header>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p role="status">{m.loading()}</p>}
			{query.isSuccess && query.data.length === 0 && <p>{m.empty()}</p>}
			<div className="account-list">
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
						<div className="account-body">
							<h2>{account.name}</h2>
							<p>{account.email}</p>
						</div>
						<span
							className={
								account.enabled ? "status-pill" : "status-pill failure"
							}
						>
							{account.enabled
								? m.studio_account_enabled()
								: m.studio_account_disabled()}
						</span>
						<ArrowUpRight size={18} aria-hidden="true" />
					</button>
				))}
			</div>
		</div>
	);
}

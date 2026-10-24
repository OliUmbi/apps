import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { ArrowLeft } from "lucide-react";
import { AccountDetailsForm } from "./accounts/account-details-form";
import { AccountPasswordForm } from "./accounts/account-password-form";
import { AccountPermissions } from "./accounts/account-permissions";

export function AccountEditor({
	account,
	onClose,
	onDelete,
}: {
	account: Account;
	onClose: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="grid gap-[22px] w-full">
			<Button className="workspace-back" onClick={onClose}>
				<ArrowLeft size={16} /> {m.studio_back_to_accounts()}
			</Button>
			<header className="page-heading">
				<div>
					<p className="page-kicker">{m.studio_account_workspace()}</p>
					<h1>{account.name}</h1>
					<p>{m.studio_account_settings()}</p>
				</div>
			</header>
			<div className="grid grid-cols-2 gap-4 items-start max-[760px]:grid-cols-1">
				<AccountDetailsForm account={account} />
				<AccountPermissions accountId={account.id} />
				<AccountPasswordForm accountId={account.id} />
			</div>
			<section className="record-danger-zone">
				<div>
					<strong>{m.delete_record()}</strong>
					<p>{m.confirm_delete_description()}</p>
				</div>
				<Button className="button danger" onClick={onDelete}>
					{m.delete_record()}
				</Button>
			</section>
		</div>
	);
}

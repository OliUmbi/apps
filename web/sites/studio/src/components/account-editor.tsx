import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { ArrowLeft } from "lucide-react";
import { AccountDetailsForm } from "./accounts/account-details-form";
import { AccountPasswordForm } from "./accounts/account-password-form";
import { AccountPermissions } from "./accounts/account-permissions";
import { Button } from "./ui/button";
import { DangerZone } from "./ui/danger-zone";
import { PageHeader } from "./ui/page-header";

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
		<div className="grid gap-6 w-full">
			<Button variant="ghost" onClick={onClose}>
				<ArrowLeft size={16} /> {m.studio_back_to_accounts()}
			</Button>
			<PageHeader
				kicker={m.studio_account_workspace()}
				title={account.name}
				description={m.studio_account_settings()}
			/>
			<div className="grid grid-cols-2 gap-4 items-start max-md:grid-cols-1">
				<AccountDetailsForm account={account} />
				<AccountPermissions accountId={account.id} />
				<AccountPasswordForm accountId={account.id} />
			</div>
			<DangerZone
				title={m.delete_record()}
				description={m.confirm_delete_description()}
				actions={
					<Button variant="danger" onClick={onDelete}>
						{m.delete_record()}
					</Button>
				}
			/>
		</div>
	);
}

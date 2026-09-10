import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	createAccount,
	deleteAccount,
	listAccounts,
} from "../server/accounts.functions";
import { newAccountSchema } from "../studio/account.schema";
import { AccountEditor } from "./account-editor";
import { DeleteConfirmation } from "./delete-confirmation";
import { Button, Form, FormFeedback, InputField } from "./ui/index";

export function AccountsView() {
	const cache = useQueryClient();
	const list = useServerFn(listAccounts),
		create = useServerFn(createAccount),
		remove = useServerFn(deleteAccount);
	const [selected, setSelected] = useState<Account | null>(null);
	const [deleting, setDeleting] = useState<string | null>(null);
	const query = useQuery({ queryKey: ["accounts"], queryFn: () => list() });
	const refresh = () => cache.invalidateQueries({ queryKey: ["accounts"] });
	const creation = useMutation({
		mutationFn: async (form: FormData) =>
			create({ data: newAccountSchema.parse(Object.fromEntries(form)) }),
		onSuccess: refresh,
	});
	const deletion = useMutation({
		mutationFn: (id: string) => remove({ data: id }),
		onSuccess: async () => {
			await refresh();
			setDeleting(null);
		},
	});
	return (
		<div className="content-stack">
			<header className="page-heading">
				<h1>{m.studio_accounts()}</h1>
			</header>
			<Form
				className="panel grid gap-4 p-6"
				onSubmit={(event) => {
					event.preventDefault();
					const form = event.currentTarget;
					creation.mutate(new FormData(form), {
						onSuccess: () => form.reset(),
					});
				}}
			>
				<InputField name="name" label={m.studio_account_name()} required />
				<InputField
					name="email"
					type="email"
					label={m.studio_account_email()}
					required
				/>
				<InputField
					name="password"
					type="password"
					autoComplete="new-password"
					label={m.studio_new_password()}
					required
				/>
				<Button
					type="submit"
					className="button primary"
					disabled={creation.isPending}
				>
					{m.create()}
				</Button>
				<FormFeedback error={creation.isError ? m.error_generic() : null} />
			</Form>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p>{m.loading()}</p>}
			{query.data?.map((account) => (
				<article
					key={account.id}
					className="panel flex flex-wrap items-center justify-between gap-4 p-5"
				>
					<div>
						<h2>{account.name}</h2>
						<p>
							{account.email} ·{" "}
							{account.enabled
								? m.studio_account_enabled()
								: m.studio_account_disabled()}
						</p>
					</div>
					<div className="flex gap-2">
						<Button className="button" onClick={() => setSelected(account)}>
							{m.edit()}
						</Button>
						<Button
							className="button danger"
							onClick={() => setDeleting(account.id)}
						>
							{m.delete_record()}
						</Button>
					</div>
				</article>
			))}
			{selected && (
				<AccountEditor account={selected} onClose={() => setSelected(null)} />
			)}
			{deleting && (
				<DeleteConfirmation
					pending={deletion.isPending}
					error={deletion.isError}
					onConfirm={() => deletion.mutate(deleting)}
					onClose={() => setDeleting(null)}
				/>
			)}
		</div>
	);
}

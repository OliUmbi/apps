import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { newAccountSchema } from "../model/accounts";
import { Route } from "../routes/index";
import {
	createAccount,
	deleteAccount,
	listAccounts,
} from "../server/accounts.functions";
import { AccountEditor } from "./account-editor";
import { DeleteConfirmation } from "./delete-confirmation";
import { FormFeedback } from "./form-feedback";
import { InputField } from "./input-field";

export function AccountsView() {
	const [deleting, setDeleting] = useState<string | null>(null);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const cache = useQueryClient();
	const list = useServerFn(listAccounts),
		create = useServerFn(createAccount),
		remove = useServerFn(deleteAccount);
	const query = useQuery({ queryKey: ["accounts"], queryFn: () => list() });
	const refresh = () => cache.invalidateQueries({ queryKey: ["accounts"] });
	const creation = useMutation({
		mutationFn: async (form: FormData) =>
			create({ data: newAccountSchema.parse(Object.fromEntries(form)) }),
		onSuccess: refresh,
	});
	const deletion = useMutation({
		mutationFn: (id: string) => remove({ data: id }),
		onSuccess: refresh,
	});
	const selected = query.data?.find((account) => account.id === search.record);
	const go = (mode: "list" | "create" | "detail", record?: string) =>
		void navigate({ search: { ...search, mode, record } });
	if (search.mode === "detail" && selected)
		return (
			<>
				<AccountEditor
					account={selected}
					onClose={() => go("list")}
					onDelete={() => setDeleting(selected.id)}
				/>
				{deleting ? (
					<DeleteConfirmation
						pending={deletion.isPending}
						error={deletion.isError}
						onConfirm={() =>
							deletion.mutate(deleting, {
								onSuccess: () => {
									setDeleting(null);
									go("list");
								},
							})
						}
						onClose={() => setDeleting(null)}
					/>
				) : null}
			</>
		);
	if (search.mode === "create")
		return (
			<div className="content-stack workspace-page">
				<Button className="workspace-back" onClick={() => go("list")}>
					<ArrowLeft size={16} /> {m.studio_back_to_accounts()}
				</Button>
				<header className="page-heading">
					<div>
						<p className="page-kicker">{m.studio_account_workspace()}</p>
						<h1>{m.studio_create_account()}</h1>
						<p>{m.studio_create_account_help()}</p>
					</div>
				</header>
				<section className="settings-panel settings-panel-narrow">
					<header>
						<UserRound size={19} />
						<div>
							<h2>{m.studio_profile_details()}</h2>
						</div>
					</header>
					<Form
						className="grid gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							creation.mutate(new FormData(event.currentTarget), {
								onSuccess: () => go("list"),
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
						<div className="settings-actions">
							<Button
								type="button"
								className="button"
								onClick={() => go("list")}
							>
								{m.cancel()}
							</Button>
							<Button
								type="submit"
								className="button primary"
								disabled={creation.isPending}
							>
								{m.create()}
							</Button>
						</div>
						<FormFeedback error={creation.isError ? m.error_generic() : null} />
					</Form>
				</section>
			</div>
		);
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{m.studio_system()}</p>
					<h1>{m.studio_accounts()}</h1>
					<p>{m.studio_accounts_intro()}</p>
				</div>
				<Button className="button primary" onClick={() => go("create")}>
					<Plus size={16} /> {m.create()}
				</Button>
			</header>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending ? <p>{m.loading()}</p> : null}
			<div className="account-list">
				{query.data?.map((account) => (
					<button
						type="button"
						key={account.id}
						className="account-row cursor-pointer"
						onClick={() => go("detail", account.id)}
					>
						<div className="account-avatar">
							{account.name.slice(0, 1).toUpperCase()}
						</div>
						<div className="account-copy">
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

import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";

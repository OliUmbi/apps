import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowLeft,
	Check,
	KeyRound,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import {
	changePassword,
	getAccount,
	setPermission,
	updateAccount,
} from "../server/accounts.functions";
import {
	passwordSchema,
	permissionSchema,
	updateAccountSchema,
} from "../studio/account.schema";
import {
	Button,
	Checkbox,
	Field,
	Form,
	FormFeedback,
	InputField,
} from "./ui/index";

export function AccountEditor({
	account,
	onClose,
}: {
	account: Account;
	onClose: () => void;
}) {
	const cache = useQueryClient();
	const get = useServerFn(getAccount);
	const update = useServerFn(updateAccount);
	const password = useServerFn(changePassword);
	const permission = useServerFn(setPermission);
	const details = useQuery({
		queryKey: ["account", account.id],
		queryFn: () =>
			get({ data: account.id }) as Promise<{
				account: Account;
				permissions: { permission: string }[];
			}>,
	});
	const save = useMutation({
		mutationFn: async (form: FormData) =>
			update({
				data: updateAccountSchema.parse({
					...Object.fromEntries(form),
					id: account.id,
					enabled: form.get("enabled") === "on",
				}),
			}),
		onSuccess: () => cache.invalidateQueries({ queryKey: ["accounts"] }),
	});
	const reset = useMutation({
		mutationFn: async (form: FormData) =>
			password({
				data: {
					id: account.id,
					password: passwordSchema.parse(form.get("password")),
				},
			}),
	});
	const grant = useMutation({
		mutationFn: permission,
		onSuccess: () =>
			cache.invalidateQueries({ queryKey: ["account", account.id] }),
	});
	return (
		<div className="content-stack workspace-page">
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
			<div className="settings-grid">
				<section className="settings-panel">
					<header>
						<UserRound size={19} />
						<div>
							<h2>{m.studio_profile_details()}</h2>
							<p>{m.studio_account_identity_help()}</p>
						</div>
					</header>
					<Form
						className="grid gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							save.mutate(new FormData(event.currentTarget));
						}}
					>
						<InputField
							name="name"
							label={m.studio_account_name()}
							defaultValue={account.name}
							required
						/>
						<InputField
							name="email"
							type="email"
							label={m.studio_account_email()}
							defaultValue={account.email}
							required
						/>
						<Field.Root className="flex items-center gap-3">
							<Checkbox.Root
								name="enabled"
								defaultChecked={account.enabled}
								className="studio-checkbox"
							>
								<Checkbox.Indicator>
									<Check size={13} aria-hidden="true" />
								</Checkbox.Indicator>
							</Checkbox.Root>
							<Field.Label>{m.studio_account_enabled()}</Field.Label>
						</Field.Root>
						<div className="settings-actions">
							<Button
								type="submit"
								className="button primary"
								disabled={save.isPending}
							>
								{m.save()}
							</Button>
						</div>
						<FormFeedback
							error={save.isError ? m.error_generic() : null}
							success={save.isSuccess ? m.studio_profile_saved() : null}
						/>
					</Form>
				</section>
				<section className="settings-panel">
					<header>
						<ShieldCheck size={19} />
						<div>
							<h2>{m.studio_permissions()}</h2>
							<p>{m.studio_permissions_help()}</p>
						</div>
					</header>
					<div className="permission-list">
						{permissionSchema.options.map((value) => (
							<Field.Root key={value} className="permission-row">
								<Checkbox.Root
									checked={
										details.data?.permissions.some(
											(item) => item.permission === value,
										) ?? false
									}
									disabled={!details.data || grant.isPending}
									onCheckedChange={(granted) =>
										grant.mutate({
											data: { id: account.id, permission: value, granted },
										})
									}
									className="studio-checkbox"
								>
									<Checkbox.Indicator>
										<Check size={13} aria-hidden="true" />
									</Checkbox.Indicator>
								</Checkbox.Root>
								<div>
									<Field.Label>{permissionLabel(value)}</Field.Label>
									<small>{value}</small>
								</div>
							</Field.Root>
						))}
					</div>
					<FormFeedback
						error={details.isError || grant.isError ? m.error_generic() : null}
					/>
				</section>
				<section className="settings-panel settings-panel-wide">
					<header>
						<KeyRound size={19} />
						<div>
							<h2>{m.studio_password_reset()}</h2>
							<p>{m.studio_password_reset_help()}</p>
						</div>
					</header>
					<Form
						className="password-reset-form"
						onSubmit={(event) => {
							event.preventDefault();
							const form = event.currentTarget;
							reset.mutate(new FormData(event.currentTarget), {
								onSuccess: () => form.reset(),
							});
						}}
					>
						<InputField
							name="password"
							type="password"
							autoComplete="new-password"
							label={m.studio_new_password()}
							required
						/>
						<Button type="submit" className="button" disabled={reset.isPending}>
							{m.studio_change_password()}
						</Button>
					</Form>
					<FormFeedback
						error={reset.isError ? m.error_generic() : null}
						success={reset.isSuccess ? m.studio_password_saved() : null}
					/>
				</section>
			</div>
		</div>
	);
}

function permissionLabel(value: string) {
	if (value === "studio.admin") return m.studio_administrator();
	const site = value.split(".")[0] ?? value;
	return `${site.charAt(0).toUpperCase()}${site.slice(1)}`;
}

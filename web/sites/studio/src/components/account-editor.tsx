import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
	Dialog,
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
		queryFn: () => get({ data: account.id }),
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
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: ["accounts"] });
			onClose();
		},
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
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !save.isPending && !grant.isPending && !reset.isPending)
					onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-60 grid max-h-[90vh] w-[min(95vw,40rem)] -translate-x-1/2 -translate-y-1/2 gap-6 overflow-auto rounded-xl bg-zinc-900 p-6 text-white">
					<Dialog.Title>{account.name}</Dialog.Title>
					<Dialog.Description>{m.studio_account_settings()}</Dialog.Description>
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
								className="grid size-5 place-items-center rounded border border-white/40 data-checked:bg-violet-600"
							>
								<Checkbox.Indicator>✓</Checkbox.Indicator>
							</Checkbox.Root>
							<Field.Label>{m.studio_account_enabled()}</Field.Label>
						</Field.Root>
						<Button
							type="submit"
							className="button primary"
							disabled={save.isPending}
						>
							{m.save()}
						</Button>
						<FormFeedback error={save.isError ? m.error_generic() : null} />
					</Form>
					<section className="grid gap-3">
						<h2>{m.studio_permissions()}</h2>
						{permissionSchema.options.map((value) => (
							<Field.Root key={value} className="flex items-center gap-3">
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
									className="grid size-5 place-items-center rounded border border-white/40 data-checked:bg-violet-600"
								>
									<Checkbox.Indicator>✓</Checkbox.Indicator>
								</Checkbox.Root>
								<Field.Label>{value}</Field.Label>
							</Field.Root>
						))}
						<FormFeedback
							error={
								details.isError || grant.isError ? m.error_generic() : null
							}
						/>
					</section>
					<Form
						className="grid gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							reset.mutate(new FormData(event.currentTarget));
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
							{m.save()}
						</Button>
						<FormFeedback
							error={reset.isError ? m.error_generic() : null}
							success={reset.isSuccess ? m.studio_password_saved() : null}
						/>
					</Form>
					<Button className="button" onClick={onClose}>
						{m.cancel()}
					</Button>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, UserRound } from "lucide-react";
import { updateAccountSchema } from "../../model/accounts";
import { updateAccount } from "../../server/accounts.functions";
import { InputField } from "../input-field";

export function AccountDetailsForm({ account }: { account: Account }) {
	const cache = useQueryClient();
	const router = useRouter();
	const update = useServerFn(updateAccount);
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
			await Promise.all([
				cache.invalidateQueries({ queryKey: ["accounts"] }),
				cache.invalidateQueries({ queryKey: ["account", account.id] }),
			]);
			await router.invalidate();
		},
	});
	return (
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
				onChange={() => {
					if (save.isSuccess || save.isError) save.reset();
				}}
				onSubmit={(event) => {
					event.preventDefault();
					if (save.isPending) return;
					save.mutate(new FormData(event.currentTarget));
				}}
			>
				<InputField
					disabled={save.isPending}
					name="name"
					label={m.name()}
					defaultValue={account.name}
					required
				/>
				<InputField
					disabled={save.isPending}
					name="email"
					type="email"
					label={m.email()}
					defaultValue={account.email}
					required
				/>
				<Field.Root className="flex items-center gap-3">
					<Checkbox.Root
						disabled={save.isPending}
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
	);
}

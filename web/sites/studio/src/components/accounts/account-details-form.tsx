import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { updateAccountSchema } from "../../model/accounts";
import { updateAccount } from "../../server/accounts.functions";
import { InputField } from "../input-field";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { FormFooter } from "../ui/form-footer";
import { Panel } from "../ui/panel";

export function AccountDetailsForm({ account }: { account: Account }) {
	const cache = useQueryClient();
	const router = useRouter();
	const update = useServerFn(updateAccount);
	const [enabled, setEnabled] = useState(account.enabled);
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
		<Panel
			title={m.studio_profile_details()}
			description={m.studio_account_identity_help()}
			icon={UserRound}
		>
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
				<Checkbox
					name="enabled"
					label={m.studio_account_enabled()}
					checked={enabled}
					onChange={setEnabled}
					disabled={save.isPending}
				/>
				<FormFooter>
					<Button type="submit" variant="primary" disabled={save.isPending}>
						{m.save()}
					</Button>
				</FormFooter>
				<Alert tone={save.isError ? "error" : "success"}>
					{save.isError
						? m.error_generic()
						: save.isSuccess
							? m.studio_profile_saved()
							: null}
				</Alert>
			</Form>
		</Panel>
	);
}

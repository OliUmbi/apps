import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, UserRound } from "lucide-react";
import { newAccountSchema } from "../../model/accounts";
import { createAccount } from "../../server/accounts.functions";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { FormFooter } from "../ui/form-footer";
import { PageHeader } from "../ui/page-header";
import { Panel } from "../ui/panel";
import { TextField } from "../ui/text-field";

export function CreateAccountForm({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: () => void;
}) {
	const cache = useQueryClient();
	const create = useServerFn(createAccount);
	const creation = useMutation({
		mutationFn: (form: FormData) =>
			create({ data: newAccountSchema.parse(Object.fromEntries(form)) }),
		onSuccess: () => cache.invalidateQueries({ queryKey: ["accounts"] }),
	});
	return (
		<div className="grid gap-6 w-full">
			<Button variant="ghost" onClick={() => onClose()}>
				<ArrowLeft size={16} /> {m.studio_back_to_accounts()}
			</Button>
			<PageHeader
				kicker={m.studio_account_workspace()}
				title={m.studio_create_account()}
				description={m.studio_create_account_help()}
			/>
			<div className="max-w-2xl">
				<Panel title={m.studio_profile_details()} icon={UserRound}>
					<Form
						className="grid gap-4"
						onChange={() => {
							if (creation.isSuccess || creation.isError) creation.reset();
						}}
						onSubmit={(event) => {
							event.preventDefault();
							if (creation.isPending) return;
							creation.mutate(new FormData(event.currentTarget), {
								onSuccess: onCreated,
							});
						}}
					>
						<TextField
							disabled={creation.isPending}
							name="name"
							label={m.name()}
							required
						/>
						<TextField
							disabled={creation.isPending}
							name="email"
							type="email"
							label={m.email()}
							required
						/>
						<TextField
							disabled={creation.isPending}
							name="password"
							type="password"
							autoComplete="new-password"
							label={m.studio_new_password()}
							required
						/>
						<FormFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onClose()}
							>
								{m.cancel()}
							</Button>
							<Button
								type="submit"
								variant="primary"
								disabled={creation.isPending}
							>
								{m.create()}
							</Button>
						</FormFooter>
						<Alert>{creation.isError ? m.error_generic() : null}</Alert>
					</Form>
				</Panel>
			</div>
		</div>
	);
}

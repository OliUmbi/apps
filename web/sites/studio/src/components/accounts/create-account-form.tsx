import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, UserRound } from "lucide-react";
import { newAccountSchema } from "../../model/accounts";
import { createAccount } from "../../server/accounts.functions";
import { InputField } from "../input-field";

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
		<div className="content-stack workspace-page">
			<Button className="workspace-back" onClick={() => onClose()}>
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
					<InputField
						disabled={creation.isPending}
						name="name"
						label={m.name()}
						required
					/>
					<InputField
						disabled={creation.isPending}
						name="email"
						type="email"
						label={m.email()}
						required
					/>
					<InputField
						disabled={creation.isPending}
						name="password"
						type="password"
						autoComplete="new-password"
						label={m.studio_new_password()}
						required
					/>
					<div className="settings-actions">
						<Button type="button" className="button" onClick={() => onClose()}>
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
}

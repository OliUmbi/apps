import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, UserRound } from "lucide-react";
import {
	changeProfilePassword,
	getProfile,
	updateProfile,
} from "../server/profile.functions";
import { profilePasswordSchema, profileSchema } from "../studio/profile.schema";
import { Button, Form, FormFeedback, InputField } from "./ui/index";

export function ProfileView() {
	const cache = useQueryClient();
	const get = useServerFn(getProfile);
	const update = useServerFn(updateProfile);
	const changePassword = useServerFn(changeProfilePassword);
	const profile = useQuery({ queryKey: ["profile"], queryFn: () => get() });
	const saving = useMutation({
		mutationFn: async (form: FormData) =>
			update({ data: profileSchema.parse(Object.fromEntries(form)) }),
		onSuccess: () => cache.invalidateQueries({ queryKey: ["profile"] }),
	});
	const password = useMutation({
		mutationFn: async (form: FormData) =>
			changePassword({
				data: profilePasswordSchema.parse(Object.fromEntries(form)),
			}),
	});
	return (
		<div className="content-stack workspace-page">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{m.studio_personal_workspace()}</p>
					<h1>{m.studio_my_profile()}</h1>
					<p>{m.studio_profile_intro()}</p>
				</div>
			</header>
			{profile.isPending ? <p>{m.loading()}</p> : null}
			<FormFeedback error={profile.isError ? m.error_generic() : null} />
			{profile.data ? (
				<div className="settings-grid">
					<section className="settings-panel">
						<header>
							<UserRound size={19} />
							<div>
								<h2>{m.studio_profile_details()}</h2>
								<p>{m.studio_profile_details_help()}</p>
							</div>
						</header>
						<Form
							className="grid gap-4"
							onSubmit={(event) => {
								event.preventDefault();
								saving.mutate(new FormData(event.currentTarget));
							}}
						>
							<InputField
								name="name"
								label={m.studio_account_name()}
								defaultValue={profile.data.account.name}
								required
							/>
							<InputField
								name="email"
								type="email"
								label={m.studio_account_email()}
								defaultValue={profile.data.account.email}
								required
							/>
							<div className="settings-actions">
								<Button
									className="button primary"
									type="submit"
									disabled={saving.isPending}
								>
									{m.save()}
								</Button>
							</div>
							<FormFeedback
								error={saving.isError ? m.error_generic() : null}
								success={saving.isSuccess ? m.studio_profile_saved() : null}
							/>
						</Form>
					</section>
					<section className="settings-panel">
						<header>
							<KeyRound size={19} />
							<div>
								<h2>{m.studio_password()}</h2>
								<p>{m.studio_password_help()}</p>
							</div>
						</header>
						<Form
							className="grid gap-4"
							onSubmit={(event) => {
								event.preventDefault();
								const form = event.currentTarget;
								password.mutate(new FormData(event.currentTarget), {
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
							<InputField
								name="confirmation"
								type="password"
								autoComplete="new-password"
								label={m.studio_password_confirmation()}
								required
							/>
							<div className="settings-actions">
								<Button
									className="button"
									type="submit"
									disabled={password.isPending}
								>
									{m.studio_change_password()}
								</Button>
							</div>
							<FormFeedback
								error={password.isError ? m.studio_password_mismatch() : null}
								success={password.isSuccess ? m.studio_password_saved() : null}
							/>
						</Form>
					</section>
				</div>
			) : null}
		</div>
	);
}

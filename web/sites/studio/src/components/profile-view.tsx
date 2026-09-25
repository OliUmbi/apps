import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "../server/profile.functions";
import { ProfileDetailsForm } from "./profile/profile-details-form";
import { ProfilePasswordForm } from "./profile/profile-password-form";

export function ProfileView() {
	const get = useServerFn(getProfile);
	const profile = useQuery({ queryKey: ["profile"], queryFn: () => get() });
	return (
		<div className="content-stack workspace-page">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{m.studio_personal_workspace()}</p>
					<h1>{m.studio_my_profile()}</h1>
					<p>{m.studio_profile_description()}</p>
				</div>
			</header>
			{profile.isPending ? <p>{m.loading()}</p> : null}
			<FormFeedback error={profile.isError ? m.error_generic() : null} />
			{profile.data ? (
				<div className="settings-grid">
					<ProfileDetailsForm
						key={profile.data.account.id}
						account={profile.data.account}
					/>
					<ProfilePasswordForm />
				</div>
			) : null}
		</div>
	);
}

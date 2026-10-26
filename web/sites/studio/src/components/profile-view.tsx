import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "../server/profile.functions";
import { ProfileDetailsForm } from "./profile/profile-details-form";
import { ProfilePasswordForm } from "./profile/profile-password-form";
import { Alert } from "./ui/alert";
import { PageHeader } from "./ui/page-header";

export function ProfileView() {
	const get = useServerFn(getProfile);
	const profile = useQuery({ queryKey: ["profile"], queryFn: () => get() });
	return (
		<div className="grid gap-6 w-full">
			<PageHeader
				kicker={m.studio_personal_workspace()}
				title={m.studio_my_profile()}
				description={m.studio_profile_description()}
			/>
			{profile.isPending ? <p>{m.loading()}</p> : null}
			<Alert>{profile.isError ? m.error_generic() : null}</Alert>
			{profile.data ? (
				<div className="grid grid-cols-2 gap-4 items-start max-md:grid-cols-1">
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

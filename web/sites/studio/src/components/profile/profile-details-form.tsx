import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import type { Account } from "@oliumbi/identity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { UserRound } from "lucide-react";
import { profileSchema } from "../../model/profile";
import { updateProfile } from "../../server/profile.functions";
import { InputField } from "../input-field";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { FormFooter } from "../ui/form-footer";
import { Panel } from "../ui/panel";

export function ProfileDetailsForm({ account }: { account: Account }) {
	const cache = useQueryClient();
	const router = useRouter();
	const update = useServerFn(updateProfile);
	const saving = useMutation({
		mutationFn: async (form: FormData) =>
			update({ data: profileSchema.parse(Object.fromEntries(form)) }),
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: ["profile"] });
			await router.invalidate();
		},
	});
	return (
		<Panel
			title={m.studio_profile_details()}
			description={m.studio_profile_details_help()}
			icon={UserRound}
		>
			<Form
				className="grid gap-4"
				onChange={() => {
					if (saving.isSuccess || saving.isError) saving.reset();
				}}
				onSubmit={(event) => {
					event.preventDefault();
					if (saving.isPending) return;
					saving.mutate(new FormData(event.currentTarget));
				}}
			>
				<InputField
					disabled={saving.isPending}
					name="name"
					label={m.name()}
					defaultValue={account.name}
					required
				/>
				<InputField
					disabled={saving.isPending}
					name="email"
					type="email"
					label={m.email()}
					defaultValue={account.email}
					required
				/>
				<FormFooter>
					<Button variant="primary" type="submit" disabled={saving.isPending}>
						{m.save()}
					</Button>
				</FormFooter>
				<Alert tone={saving.isError ? "error" : "success"}>
					{saving.isError
						? m.error_generic()
						: saving.isSuccess
							? m.studio_profile_saved()
							: null}
				</Alert>
			</Form>
		</Panel>
	);
}

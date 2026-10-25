import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { permissionSchema } from "../../model/accounts";
import { studioSites } from "../../model/sites";
import { getAccount, setPermission } from "../../server/accounts.functions";
import { Checkbox } from "../ui/checkbox";
import { Panel } from "../ui/panel";

export function AccountPermissions({ accountId }: { accountId: string }) {
	const cache = useQueryClient();
	const router = useRouter();
	const fetchAccount = useServerFn(getAccount);
	const permission = useServerFn(setPermission);
	const details = useQuery({
		queryKey: ["account", accountId],
		queryFn: () => fetchAccount({ data: accountId }),
	});
	const changePermission = useMutation({
		mutationFn: permission,
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: ["account", accountId] });
			await router.invalidate();
		},
	});
	return (
		<Panel
			title={m.studio_permissions()}
			description={m.studio_permissions_help()}
			icon={ShieldCheck}
		>
			<div className="grid gap-px overflow-hidden rounded-[5px] border border-border-soft bg-border-soft">
				{permissionSchema.options.map((value) => (
					<div key={value} className="permission-row">
						<div className="grid">
							<Checkbox
								label={permissionLabel(value)}
								checked={
									details.data?.permissions.some(
										(item) => item.permission === value,
									) ?? false
								}
								onChange={(granted) =>
									changePermission.mutate({
										data: { id: accountId, permission: value, granted },
									})
								}
							/>
							<small>{value}</small>
						</div>
					</div>
				))}
			</div>
			<FormFeedback
				error={
					details.isError || changePermission.isError ? m.error_generic() : null
				}
			/>
		</Panel>
	);
}

function permissionLabel(permission: string) {
	if (permission === "studio.admin") return m.studio_administrator();
	return (
		studioSites.find((site) => permission === `${site.id}.manage`)?.name ??
		permission
	);
}

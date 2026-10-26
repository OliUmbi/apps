import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { permissionSchema } from "../../model/accounts";
import { studioSites } from "../../model/sites";
import { getAccount, setPermission } from "../../server/accounts.functions";
import { Alert } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { ListShell } from "../ui/list";
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
			<ListShell>
				{permissionSchema.options.map((value) => (
					<div
						key={value}
						className="flex items-center gap-3 bg-layer-1 px-3 py-3"
					>
						<Checkbox
							label={permissionLabel(value)}
							description={value}
							checked={
								details.data?.permissions.some(
									(item) => item.permission === value,
								) ?? false
							}
							disabled={!details.data || changePermission.isPending}
							onChange={(granted) =>
								changePermission.mutate({
									data: { id: accountId, permission: value, granted },
								})
							}
						/>
					</div>
				))}
			</ListShell>
			<Alert>
				{details.isError || changePermission.isError ? m.error_generic() : null}
			</Alert>
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

import { Checkbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ShieldCheck } from "lucide-react";
import { permissionSchema } from "../../model/accounts";
import { studioSites } from "../../model/sites";
import { getAccount, setPermission } from "../../server/accounts.functions";

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
		<section className="settings-panel">
			<header>
				<ShieldCheck size={19} />
				<div>
					<h2>{m.studio_permissions()}</h2>
					<p>{m.studio_permissions_help()}</p>
				</div>
			</header>
			<div className="permission-list">
				{permissionSchema.options.map((value) => (
					<Field.Root key={value} className="permission-row">
						<Checkbox.Root
							checked={
								details.data?.permissions.some(
									(item) => item.permission === value,
								) ?? false
							}
							disabled={!details.data || changePermission.isPending}
							onCheckedChange={(granted) =>
								changePermission.mutate({
									data: { id: accountId, permission: value, granted },
								})
							}
							className="studio-checkbox"
						>
							<Checkbox.Indicator>
								<Check size={13} aria-hidden="true" />
							</Checkbox.Indicator>
						</Checkbox.Root>
						<div>
							<Field.Label>{permissionLabel(value)}</Field.Label>
							<small>{value}</small>
						</div>
					</Field.Root>
				))}
			</div>
			<FormFeedback
				error={
					details.isError || changePermission.isError ? m.error_generic() : null
				}
			/>
		</section>
	);
}

function permissionLabel(permission: string) {
	if (permission === "studio.admin") return m.studio_administrator();
	return (
		studioSites.find((site) => permission === `${site.id}.manage`)?.name ??
		permission
	);
}

import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { deleteAccount, getAccount } from "../../server/accounts.functions";
import { AccountEditor } from "../account-editor";
import { DeleteConfirmation } from "../delete-confirmation";
import { Button } from "../ui/button";
import { Title } from "../ui/text";

export function AccountWorkspace({
	id,
	onClose,
}: {
	id: string;
	onClose: () => void;
}) {
	const cache = useQueryClient();
	const get = useServerFn(getAccount);
	const remove = useServerFn(deleteAccount);
	const [deleting, setDeleting] = useState(false);
	const query = useQuery({
		queryKey: ["account", id],
		queryFn: () => get({ data: id }),
	});
	const deletion = useMutation({
		mutationFn: () => remove({ data: id }),
		onSuccess: async () => {
			cache.removeQueries({ queryKey: ["account", id] });
			await cache.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
	return (
		<>
			{query.data ? (
				<AccountEditor
					account={query.data.account}
					onClose={onClose}
					onDelete={() => {
						deletion.reset();
						setDeleting(true);
					}}
				/>
			) : (
				<div className="grid gap-[22px] w-full">
					<Button variant="ghost" onClick={onClose}>
						<ArrowLeft size={16} aria-hidden="true" />{" "}
						{m.studio_back_to_accounts()}
					</Button>
					<Title as="h1" size="lg">
						{m.studio_accounts()}
					</Title>
					{query.isPending && <p role="status">{m.loading()}</p>}
				</div>
			)}
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{deleting && (
				<DeleteConfirmation
					pending={deletion.isPending}
					error={deletion.isError}
					onConfirm={() => deletion.mutate(undefined, { onSuccess: onClose })}
					onClose={() => setDeleting(false)}
				/>
			)}
		</>
	);
}

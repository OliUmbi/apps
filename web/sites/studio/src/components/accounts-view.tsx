import { Route } from "../routes/index";
import { AccountList } from "./accounts/account-list";
import { AccountWorkspace } from "./accounts/account-workspace";
import { CreateAccountForm } from "./accounts/create-account-form";

export function AccountsView() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	function select(mode: "list" | "create" | "detail", record?: string) {
		void navigate({ search: { ...search, mode, record } });
	}
	if (search.mode === "create") {
		return (
			<CreateAccountForm
				onClose={() => select("list")}
				onCreated={() => select("list")}
			/>
		);
	}
	if (search.mode === "detail" && search.record) {
		return (
			<AccountWorkspace
				key={search.record}
				id={search.record}
				onClose={() => select("list")}
			/>
		);
	}
	return (
		<AccountList
			onCreate={() => select("create")}
			onOpen={(id) => select("detail", id)}
		/>
	);
}

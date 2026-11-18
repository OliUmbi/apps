import { Form } from "@base-ui/react/form";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { uploadAsset } from "../../server/assets.functions";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { FormFooter } from "../ui/form-footer";
import { Panel } from "../ui/panel";
import { TextField } from "../ui/text-field";

export function AssetUploadForm({
	site,
	kind,
	onUploaded,
}: {
	site: SiteId;
	kind: "images" | "documents";
	onUploaded: () => Promise<void>;
}) {
	const upload = useServerFn(uploadAsset);
	const creation = useMutation({ mutationFn: upload, onSuccess: onUploaded });
	return (
		<Panel
			title={m.upload()}
			description={m.studio_assets_upload_privacy_description()}
		>
			<Form
				className="grid gap-5"
				onChange={() => {
					if (creation.isSuccess || creation.isError) creation.reset();
				}}
				onSubmit={(event) => {
					event.preventDefault();
					if (creation.isPending) return;
					const form = event.currentTarget;
					const data = new FormData(form);
					data.set("site", site);
					data.set("kind", kind);
					data.set("visible", "false");
					creation.mutate({ data }, { onSuccess: () => form.reset() });
				}}
			>
				<div className="grid gap-5 md:grid-cols-2">
					<TextField
						disabled={creation.isPending}
						name="file"
						label={m.file()}
						type="file"
						accept={
							kind === "images" ? "image/jpeg,image/png" : "application/pdf"
						}
						required
					/>
					{kind === "documents" && (
						<TextField
							disabled={creation.isPending}
							name="slug"
							label={m.studio_assets_document_slug()}
							required
							pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
						/>
					)}
				</div>
				<Alert tone={creation.isError ? "error" : "success"}>
					{creation.isError
						? m.error_generic()
						: creation.isSuccess
							? m.studio_assets_upload_success()
							: null}
				</Alert>
				<FormFooter>
					<Button type="submit" disabled={creation.isPending} variant="primary">
						{creation.isPending ? m.loading() : m.upload()}
					</Button>
				</FormFooter>
			</Form>
		</Panel>
	);
}

import { Form } from "@base-ui/react/form";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { uploadAsset } from "../../server/assets.functions";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Body } from "../ui/text";
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
		<Form
			className="overflow-hidden rounded-md border border-line-subtle bg-layer-1 grid gap-4 p-6"
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
			<TextField
				disabled={creation.isPending}
				name="file"
				label={m.file()}
				type="file"
				accept={kind === "images" ? "image/jpeg,image/png" : "application/pdf"}
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
			<Body>{m.studio_assets_upload_privacy_description()}</Body>
			<Button type="submit" disabled={creation.isPending} variant="primary">
				{m.upload()}
			</Button>
			<Alert tone={creation.isError ? "error" : "success"}>
				{creation.isError
					? m.error_generic()
					: creation.isSuccess
						? m.studio_assets_upload_success()
						: null}
			</Alert>
		</Form>
	);
}

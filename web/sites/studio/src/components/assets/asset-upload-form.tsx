import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { uploadAsset } from "../../server/assets.functions";
import { InputField } from "../input-field";

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
			className="panel grid gap-4 p-6"
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
			<InputField
				disabled={creation.isPending}
				name="file"
				label={m.file()}
				type="file"
				accept={kind === "images" ? "image/jpeg,image/png" : "application/pdf"}
				required
			/>
			{kind === "documents" && (
				<InputField
					disabled={creation.isPending}
					name="slug"
					label={m.studio_assets_document_slug()}
					required
					pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				/>
			)}
			<p className="text-sm text-zinc-400">
				{m.studio_assets_upload_privacy_description()}
			</p>
			<Button
				type="submit"
				disabled={creation.isPending}
				className="button primary"
			>
				{m.upload()}
			</Button>
			<FormFeedback
				error={creation.isError ? m.error_generic() : null}
				success={creation.isSuccess ? m.studio_assets_upload_success() : null}
			/>
		</Form>
	);
}

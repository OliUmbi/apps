import { m } from "@oliumbi/i18n/messages";
import { useBlocker } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import type { z } from "zod";
import { studioValidationMessage } from "../../model/validation";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Form, FormActions, FormFields } from "../ui/form";
import { DiscardChangesDialog } from "./discard-changes-dialog";

export interface EditorFieldsProps<Input> {
	values: Input;
	onChange: <Name extends keyof Input>(name: Name, value: Input[Name]) => void;
	onPendingChange: (pending: boolean) => void;
}

export interface ContentEditor<Row, Input> {
	schema: z.ZodType<Input>;
	initialValues: () => Input;
	valuesFromRecord: (record: Row) => Input;
	renderFields: (props: EditorFieldsProps<Input>) => ReactNode;
}

export function ContentForm<Row, Input>({
	editor,
	record,
	pending,
	error,
	conflict,
	saved,
	onSave,
	onReload,
	onClose,
}: {
	editor: ContentEditor<Row, Input>;
	record: Row | null;
	pending: boolean;
	error: boolean;
	conflict: boolean;
	saved: boolean;
	onSave: (values: Input) => void;
	onReload: () => void;
	onClose: () => void;
}) {
	const [values, setValues] = useState(() =>
		record ? editor.valuesFromRecord(record) : editor.initialValues(),
	);
	const [validation, setValidation] = useState("");
	const [edited, setEdited] = useState(false);
	const [uploadPending, setUploadPending] = useState(false);
	const [confirmClose, setConfirmClose] = useState(false);
	const navigationBlocker = useBlocker({
		shouldBlockFn: () => edited,
		enableBeforeUnload: () => edited && !pending,
		// A successful save remounts the editor. Do not mistake its navigation for
		// an unrelated attempt to discard the submitted values.
		disabled: pending,
		withResolver: true,
	});

	const onChange: EditorFieldsProps<Input>["onChange"] = (name, value) => {
		setValues((previous) => ({ ...previous, [name]: value }));
		setEdited(true);
		setValidation("");
	};
	const busy = pending || uploadPending;
	const failure =
		validation ||
		(conflict ? m.studio_content_conflict() : error ? m.error_generic() : null);
	const message =
		failure ||
		(uploadPending
			? m.studio_image_upload_in_progress()
			: saved && !edited
				? m.studio_content_saved()
				: null);

	function requestClose() {
		if (edited) {
			setConfirmClose(true);
			return;
		}
		onClose();
	}

	return (
		<>
			<Form
				onSubmit={(event) => {
					event.preventDefault();
					if (busy) return;
					const result = editor.schema.safeParse(values);
					if (!result.success) {
						setValidation(
							result.error.issues
								.map((issue) => studioValidationMessage(issue))
								.join(" · "),
						);
						return;
					}
					setValidation("");
					onSave(result.data);
				}}
			>
				<FormFields disabled={busy}>
					{editor.renderFields({
						values,
						onChange,
						onPendingChange: setUploadPending,
					})}
				</FormFields>
				<FormActions>
					<Alert tone={failure ? "error" : uploadPending ? "info" : "success"}>
						{message}
						{conflict ? (
							<Button
								type="button"
								size="sm"
								disabled={busy}
								onClick={onReload}
							>
								{m.studio_content_reload()}
							</Button>
						) : null}
					</Alert>
					<Button type="submit" variant="primary" disabled={busy}>
						{pending ? m.saving() : m.save()}
					</Button>
					<Button type="button" disabled={busy} onClick={requestClose}>
						{m.cancel()}
					</Button>
				</FormActions>
			</Form>
			<DiscardChangesDialog
				open={confirmClose}
				onCancel={() => setConfirmClose(false)}
				onDiscard={() => {
					setConfirmClose(false);
					flushSync(() => setEdited(false));
					onClose();
				}}
			/>
			<DiscardChangesDialog
				open={navigationBlocker.status === "blocked"}
				onCancel={() => {
					if (navigationBlocker.status === "blocked") navigationBlocker.reset();
				}}
				onDiscard={() => {
					if (navigationBlocker.status === "blocked")
						navigationBlocker.proceed();
				}}
			/>
		</>
	);
}

import { m } from "@oliumbi/i18n/messages";
import { type ReactNode, useState } from "react";
import type { z } from "zod";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Form, FormActions, FormFields } from "../ui/form";

export interface EditorFieldsProps<Input> {
	values: Input;
	onChange: <Name extends keyof Input>(name: Name, value: Input[Name]) => void;
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
	saved,
	onSave,
	onClose,
}: {
	editor: ContentEditor<Row, Input>;
	record: Row | null;
	pending: boolean;
	error: boolean;
	saved: boolean;
	onSave: (values: Input) => void;
	onClose: () => void;
}) {
	const [values, setValues] = useState(() =>
		record ? editor.valuesFromRecord(record) : editor.initialValues(),
	);
	const [validation, setValidation] = useState("");
	const [edited, setEdited] = useState(false);

	const onChange: EditorFieldsProps<Input>["onChange"] = (name, value) => {
		setValues((previous) => ({ ...previous, [name]: value }));
		setEdited(true);
		setValidation("");
	};

	const failure = validation || (error ? m.error_generic() : null);
	const message =
		failure || (saved && !edited ? m.studio_content_saved() : null);

	return (
		<Form
			onSubmit={(event) => {
				event.preventDefault();
				if (pending) return;
				const result = editor.schema.safeParse(values);
				if (!result.success) {
					setValidation(
						result.error.issues.map((issue) => issue.message).join(" · "),
					);
					return;
				}
				setValidation("");
				onSave(result.data);
			}}
		>
			<FormFields disabled={pending}>
				{editor.renderFields({ values, onChange })}
			</FormFields>
			<FormActions>
				<Alert tone={failure ? "error" : "success"}>{message}</Alert>
				<Button type="submit" variant="primary" disabled={pending}>
					{pending ? m.saving() : m.save()}
				</Button>
				<Button type="button" disabled={pending} onClick={onClose}>
					{m.cancel()}
				</Button>
			</FormActions>
		</Form>
	);
}

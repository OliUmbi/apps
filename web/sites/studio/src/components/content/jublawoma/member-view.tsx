import { m } from "@oliumbi/i18n/messages";
import {
	type Member,
	type MemberInput,
	memberInputFromRecord,
	memberInputSchema,
	newMemberInput,
} from "@oliumbi/jublawoma-data/content/member";
import {
	createMember,
	deleteMember,
	getMember,
	listMembers,
	updateMember,
} from "../../../server/content/jublawoma/member.functions";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { CheckboxField } from "../editor-controls";
import { ImageField } from "../image-field";
import { RoutedCollectionView } from "../routed-collection-view";

export function MembersView() {
	return (
		<RoutedCollectionView<Member, MemberInput>
			collection="jublawoma.member"
			title="Leitungsteam"
			rowKey={(record) => record.id}
			loadPage={(input) => listMembers({ data: input })}
			loadRecord={(id) => getMember({ data: { id } })}
			remove={(record) => deleteMember({ data: { id: record.id } })}
			create={(values) => createMember({ data: values })}
			update={(record, values) =>
				updateMember({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: memberInputSchema,
				initialValues: newMemberInput,
				valuesFromRecord: memberInputFromRecord,
				renderFields: (props) => <MemberFields {...props} />,
			}}
			columns={[
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "imageId",
					heading: m.image(),
					render: (record) => (
						<ImageThumbnail site="jublawoma" id={record.imageId} />
					),
				},
				{
					id: "groupName",
					heading: m.studio_field_group_name(),
					render: (record) => record.groupName,
				},
				{
					id: "leadership",
					heading: m.studio_field_leadership(),
					render: (record) => (record.leadership ? m.yes() : m.no()),
				},
			]}
		/>
	);
}

function MemberFields({ values, onChange }: EditorFieldsProps<MemberInput>) {
	return (
		<>
			<InputField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<ImageField
				site="jublawoma"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<InputField
				name="groupName"
				label={m.studio_field_group_name()}
				value={values.groupName}
				required
				onChange={(event) => onChange("groupName", event.target.value)}
			/>
			<CheckboxField
				name="leadership"
				label={m.studio_field_leadership()}
				value={values.leadership}
				onChange={(value) => onChange("leadership", value)}
			/>
		</>
	);
}

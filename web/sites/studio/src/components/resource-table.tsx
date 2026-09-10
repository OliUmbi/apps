import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { getResource, type ResourceId } from "../studio/resources";
import { CampaignSend } from "./campaign-send";
import { SubscriberActions } from "./subscriber-actions";
import { Button } from "./ui/index";
export function ResourceTable({
	resourceId,
	rows,
	onView,
	onEdit,
	onDelete,
}: {
	resourceId: ResourceId;
	rows: ResourceRecord[];
	onView: (record: ResourceRecord) => void;
	onEdit: (record: ResourceRecord) => void;
	onDelete: (record: ResourceRecord) => void;
}) {
	const resource = getResource(resourceId);
	const columns = useMemo<ColumnDef<ResourceRecord>[]>(
		() => [
			...resource.fields
				.filter((field) => field.kind !== "textarea" && field.kind !== "uuid")
				.slice(0, 5)
				.map((field) => ({
					accessorKey: field.name,
					header: field.label,
					cell: ({ getValue }: { getValue: () => unknown }) =>
						displayValue(getValue()),
				})),
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<div className="flex justify-end gap-2">
						<Button className="button" onClick={() => onView(row.original)}>
							{m.studio_view_record()}
						</Button>
						{resourceId === "zelglihof.campaign" &&
							row.original.status === "draft" && (
								<CampaignSend id={String(row.original.id)} />
							)}{" "}
						{resourceId === "zelglihof.subscriber" && (
							<SubscriberActions record={row.original} />
						)}{" "}
						{resource.edit &&
							(!resource.editableWhen ||
								row.original[resource.editableWhen.field] ===
									resource.editableWhen.value) && (
								<Button className="button" onClick={() => onEdit(row.original)}>
									{m.edit()}
								</Button>
							)}
						{resource.delete && (
							<Button
								className="button danger"
								onClick={() => onDelete(row.original)}
							>
								{m.delete_record()}
							</Button>
						)}
					</div>
				),
			},
		],
		[resource, resourceId, onView, onEdit, onDelete],
	);
	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) =>
			(resource.keys ?? ["id"]).map((key) => row[key]).join(":"),
	});
	return (
		<div className="overflow-x-auto rounded-xl border border-white/10">
			<table className="w-full text-left text-sm">
				<thead className="bg-white/5 text-zinc-400">
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id}>
							{group.headers.map((header) => (
								<th
									key={header.id}
									className="px-4 py-3 font-medium"
									scope="col"
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className="border-t border-white/10 hover:bg-white/3"
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className="max-w-sm px-4 py-3 whitespace-normal"
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
function displayValue(value: unknown) {
	if (typeof value === "boolean") return value ? m.yes() : m.no();
	return value === null ? "—" : String(value ?? "");
}

import type { RecordValue, ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { displayRecordValue } from "../studio/record-display";
import { getResource, type ResourceId } from "../studio/resources";
import { CampaignSend } from "./campaign-send";
import { Button } from "./ui/index";
export function ResourceTable({
	resourceId,
	rows,
	onView,
}: {
	resourceId: ResourceId;
	rows: ResourceRecord[];
	onView: (record: ResourceRecord) => void;
}) {
	const resource = getResource(resourceId);
	const displayedFields = resource.tableFields
		? resource.tableFields
				.map((name) => resource.fields.find((field) => field.name === name))
				.filter((field) => field !== undefined)
		: resource.fields
				.filter(
					(field) =>
						field.kind !== "textarea" &&
						(field.kind !== "uuid" || field.name === "image_id"),
				)
				.slice(0, 5);
	const columns: ColumnDef<ResourceRecord>[] = [
		...displayedFields.map((field) => ({
			accessorKey: field.name,
			header: field.label,
			cell: ({ getValue }: { getValue: () => unknown }) =>
				field.name === "image_id" && getValue() ? (
					<img
						src={`/api/assets/${String(getValue())}?site=${resourceId.split(".")[0]}`}
						alt=""
						className="table-thumbnail"
					/>
				) : (
					displayRecordValue(field, getValue() as RecordValue)
				),
		})),
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<div
					className="flex justify-end gap-2"
					role="toolbar"
					aria-label={m.studio_record_actions()}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
				>
					<Button
						className="button open-record"
						onClick={() => onView(row.original)}
					>
						{m.studio_open_record()}
						<ArrowRight size={14} aria-hidden="true" />
					</Button>
					{resourceId === "zelglihof.campaign" &&
						row.original.status === "draft" && (
							<CampaignSend id={String(row.original.id)} />
						)}
				</div>
			),
		},
	];
	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) =>
			(resource.keys ?? ["id"]).map((key) => row[key]).join(":"),
	});
	return (
		<div className="data-table">
			<table className="w-full text-left text-sm">
				<thead className="bg-white/5 text-zinc-400">
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id}>
							{group.headers.map((header) => (
								<th key={header.id} className="font-medium" scope="col">
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
							className="cursor-pointer border-t border-white/10 hover:bg-white/3 focus-visible:outline-2 focus-visible:outline-violet-400"
							onClick={() => onView(row.original)}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="max-w-sm whitespace-normal">
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

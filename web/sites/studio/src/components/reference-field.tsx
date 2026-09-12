import type { AssetImage } from "@oliumbi/assets";
import type {
	Page,
	RecordValue,
	ResourceField,
	ResourceRecord,
	SiteId,
} from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssets, uploadAsset } from "../server/assets.functions";
import { listRecords } from "../server/resources.functions";
import { type ResourceId, resourceIds } from "../studio/resources";
import { Button, Field, FormFeedback, Select } from "./ui/index";

export function ReferenceField({
	field,
	resourceId,
	value,
	onChange,
}: {
	field: ResourceField;
	resourceId: ResourceId;
	value: RecordValue;
	onChange: (value: RecordValue) => void;
}) {
	const site = resourceId.split(".")[0] as SiteId;
	const cache = useQueryClient();
	const images = field.name === "image_id";
	const parent = `${site}.${field.name.replace(/_id$/, "")}`;
	const target = resourceIds.find((id) => id === parent);
	const loadImages = useServerFn(listAssets);
	const uploadImage = useServerFn(uploadAsset);
	const loadRecords = useServerFn(listRecords);
	const query = useInfiniteQuery({
		queryKey: ["reference", site, field.name],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			if (images) {
				const page = (await loadImages({
					data: { site, kind: "images", page: pageParam, size: 30, search: "" },
				})) as Page<AssetImage>;
				return {
					...page,
					items: page.items.map((image) => ({ id: image.id, label: image.id })),
				};
			}
			if (!target) throw new Error("Unknown reference");
			const page = (await loadRecords({
				data: { resource: target, page: pageParam, size: 30, search: "" },
			})) as Page<ResourceRecord>;
			return {
				...page,
				items: page.items.map((record) => ({
					id: String(record.id),
					label: String(record.title ?? record.name ?? record.id),
				})),
			};
		},
		getNextPageParam: (page) => page.nextPage,
	});
	const options = query.data?.pages.flatMap((page) => page.items) ?? [];
	const selected = options.find((option) => option.id === value);
	const upload = useMutation({
		mutationFn: (file: File) => {
			const data = new FormData();
			data.set("site", site);
			data.set("kind", "images");
			data.set("visible", "false");
			data.set("file", file);
			return uploadImage({ data });
		},
		onSuccess: async (image) => {
			await cache.invalidateQueries({
				queryKey: ["reference", site, field.name],
			});
			onChange("image" in image ? image.image.id : image.id);
		},
	});
	return (
		<Field.Root name={field.name} className="grid gap-2">
			<Field.Label>{field.label}</Field.Label>
			<Select.Root
				value={String(value ?? "")}
				onValueChange={(value) => onChange(value || null)}
			>
				<Select.Trigger className="flex items-center gap-3 rounded-lg border border-white/20 p-3 text-left">
					{images && value && (
						<img
							src={`/api/assets/${value}?site=${site}`}
							alt=""
							className="size-12 rounded object-cover"
						/>
					)}
					<Select.Value>
						{selected?.label ??
							(value ? String(value) : m.studio_select_record())}
					</Select.Value>
				</Select.Trigger>
				<Select.Portal>
					<Select.Positioner className="z-80">
						<Select.Popup className="max-h-80 max-w-lg overflow-y-auto rounded-lg border border-white/20 bg-zinc-900 p-2 text-white">
							{field.nullable && (
								<Select.Item
									value=""
									className="rounded p-2 data-highlighted:bg-white/10"
								>
									<Select.ItemText>{m.studio_no_selection()}</Select.ItemText>
								</Select.Item>
							)}
							{options.map((option) => (
								<Select.Item
									key={option.id}
									value={option.id}
									className="flex cursor-pointer items-center gap-3 rounded p-2 data-highlighted:bg-white/10"
								>
									{images && (
										<img
											src={`/api/assets/${option.id}?site=${site}`}
											alt=""
											loading="lazy"
											className="size-14 rounded object-cover"
										/>
									)}
									<Select.ItemText>{option.label}</Select.ItemText>
								</Select.Item>
							))}
							{query.isPending && <p>{m.loading()}</p>}
							<FormFeedback error={query.isError ? m.error_generic() : null} />
							{query.hasNextPage && (
								<Button
									className="button"
									disabled={query.isFetchingNextPage}
									onClick={() => void query.fetchNextPage()}
								>
									{m.load_more()}
								</Button>
							)}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
			{images && (
				<label className="image-upload-control">
					<span>{m.studio_upload_image_here()}</span>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						disabled={upload.isPending}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) upload.mutate(file);
						}}
					/>
				</label>
			)}
			<FormFeedback error={upload.isError ? m.error_generic() : null} />
		</Field.Root>
	);
}

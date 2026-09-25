import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Select } from "@base-ui/react/select";
import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssets, uploadAsset } from "../../server/assets.functions";
import { ImageThumbnail } from "./display";

export function ImageField({
	site,
	value,
	onChange,
	nullable = false,
	label = m.image(),
}: {
	site: SiteId;
	value: string | null;
	onChange: (value: string | null) => void;
	nullable?: boolean;
	label?: string;
}) {
	const cache = useQueryClient();
	const list = useServerFn(listAssets);
	const upload = useServerFn(uploadAsset);
	const query = useInfiniteQuery({
		queryKey: ["assets", site, "images"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({
				data: { site, kind: "images", page: pageParam, size: 30, search: "" },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	const images = query.data?.pages.flatMap((page) => page.items) ?? [];
	const creation = useMutation({
		mutationFn: (file: File) => {
			const data = new FormData();
			data.set("site", site);
			data.set("kind", "images");
			data.set("visible", "false");
			data.set("file", file);
			return upload({ data });
		},
		onSuccess: async (result) => {
			onChange("image" in result ? result.image.id : result.id);
			await cache.invalidateQueries({ queryKey: ["assets", site, "images"] });
		},
	});
	return (
		<Field.Root name="imageId" className="grid gap-2">
			<Field.Label>{label}</Field.Label>
			<Select.Root
				value={value ?? ""}
				onValueChange={(value) => onChange(value || null)}
				required={!nullable}
			>
				<Select.Trigger className="flex items-center gap-3 rounded-lg border border-white/20 p-3 text-left">
					<ImageThumbnail site={site} id={value} />
					<Select.Value>{value || m.studio_select_record()}</Select.Value>
				</Select.Trigger>
				<Select.Portal>
					<Select.Positioner className="z-80">
						<Select.Popup className="max-h-80 max-w-lg overflow-y-auto rounded-lg border border-white/20 bg-zinc-900 p-2 text-white">
							{nullable && (
								<Select.Item
									value=""
									className="rounded p-2 data-highlighted:bg-white/10"
								>
									<Select.ItemText>{m.studio_no_selection()}</Select.ItemText>
								</Select.Item>
							)}
							{images.map((image) => (
								<Select.Item
									key={image.id}
									value={image.id}
									className="flex items-center gap-3 rounded p-2 data-highlighted:bg-white/10"
								>
									<ImageThumbnail site={site} id={image.id} />
									<Select.ItemText>{image.id}</Select.ItemText>
								</Select.Item>
							))}
							{query.isPending && <p role="status">{m.loading()}</p>}
							<FormFeedback error={query.isError ? m.error_generic() : null} />
							{query.hasNextPage && (
								<Button
									type="button"
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
			<label className="image-upload-control">
				<span>{m.studio_upload_image_here()}</span>
				<input
					type="file"
					accept="image/jpeg,image/png"
					disabled={creation.isPending}
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file) creation.mutate(file);
						event.target.value = "";
					}}
				/>
			</label>
			<FormFeedback error={creation.isError ? m.error_generic() : null} />
		</Field.Root>
	);
}

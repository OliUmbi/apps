import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssets, uploadAsset } from "../../server/assets.functions";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { FieldLabel, FieldMessage, FieldRoot } from "../ui/field";
import { FileInput } from "../ui/file-input";
import {
	SelectItem,
	SelectPanel,
	SelectRoot,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
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
		<FieldRoot name="imageId">
			<FieldLabel>{label}</FieldLabel>
			<SelectRoot
				value={value ?? ""}
				onValueChange={(next) =>
					onChange(typeof next === "string" && next.length > 0 ? next : null)
				}
				required={!nullable}
			>
				<SelectTrigger>
					<ImageThumbnail site={site} id={value} />
					<SelectValue>{value || m.studio_select_record()}</SelectValue>
				</SelectTrigger>
				<SelectPanel>
					{nullable && <SelectItem value="" label={m.studio_no_selection()} />}
					{images.map((image) => (
						<SelectItem
							key={image.id}
							value={image.id}
							label={image.id}
							prefix={<ImageThumbnail site={site} id={image.id} />}
						/>
					))}
					{query.isPending && <p role="status">{m.loading()}</p>}
					<Alert tone="error">{query.isError ? m.error_generic() : null}</Alert>
					{query.hasNextPage && (
						<Button
							type="button"
							size="sm"
							disabled={query.isFetchingNextPage}
							onClick={() => void query.fetchNextPage()}
						>
							{m.load_more()}
						</Button>
					)}
				</SelectPanel>
			</SelectRoot>
			<FileInput
				label={m.studio_upload_image_here()}
				accept="image/jpeg,image/png"
				disabled={creation.isPending}
				onSelect={(file) => creation.mutate(file)}
			/>
			<Alert tone="error">{creation.isError ? m.error_generic() : null}</Alert>
			<FieldMessage />
		</FieldRoot>
	);
}

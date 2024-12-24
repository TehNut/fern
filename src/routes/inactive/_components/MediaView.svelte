<script lang="ts">
	import VirtualList from "svelte-tiny-virtual-list";
	import { parseSeconds, readableTime } from "$lib/time";
	import { Badge } from "$lib/components/ui/badge";
	import type { InactiveEntry } from "../+page.svelte";
	import type { MediaType } from "$lib/anilist";

	interface Props {
		entries: InactiveEntry[];
		mediaType: MediaType;
	}

	let { entries, mediaType }: Props = $props();
</script>

<VirtualList
	width="100%"
	height={window.innerHeight - 500}
	itemCount={entries.length}
	itemSize={128}
>
	<div slot="item" let:index let:style {style}>
		{@const { media, updatedAt, status } = entries[index]}
		{@const lastUpdated = readableTime(
			parseSeconds(Math.floor(Date.now() / 1000) - updatedAt, true),
			{ includeWeeks: true }
		)}
		<div class="my-2 flex items-center gap-2" style="--media-color:{media.coverImage.color}">
			<img
				src={media.coverImage.extraLarge}
				alt="Key visual"
				class="aspect-[2/3] w-20 flex-none rounded bg-[var(--media-color)] object-cover object-center"
			/>
			<div class="flex flex-1 flex-col gap-2">
				<a
					href="https://anilist.co/{mediaType.toLowerCase()}/{media.id}"
					target="_blank"
					class="line-clamp-2 text-lg font-medium"
				>
					{media.title.romaji}
				</a>
				<div>
					<span class="text-sm font-medium">
						{lastUpdated}
					</span>
					<span class="text-xs">since last update</span>
				</div>
				<Badge class="w-max font-medium">{status}</Badge>
			</div>
		</div>
	</div>
</VirtualList>

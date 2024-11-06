<script lang="ts">
	import VirtualList from "svelte-tiny-virtual-list";
	import type { ExportEntry } from "../+page.svelte";

	interface Props {
		skipped: ExportEntry[];
	}

	let { skipped }: Props = $props();
</script>

<div class="grid gap-2">
	<VirtualList
		width="100%"
		height={window.innerHeight - 384}
		itemCount={skipped.length}
		itemSize={128}
	>
		<div slot="item" let:index let:style {style}>
			{@const { media } = skipped[index]}
			<div class="my-2 flex items-center gap-2" style="--media-color:{media.coverImage.color}">
				<img
					src={media.coverImage.extraLarge}
					alt="Key visual"
					class="aspect-[2/3] w-20 flex-none rounded bg-[var(--media-color)] object-cover object-center"
				/>
				<div class="flex flex-1 flex-col gap-2">
					<a
						href="https://anilist.co/anime/{media.id}"
						target="_blank"
						class="line-clamp-2 text-lg font-medium"
					>
						{media.title.romaji}
					</a>
				</div>
			</div>
		</div>
	</VirtualList>
</div>

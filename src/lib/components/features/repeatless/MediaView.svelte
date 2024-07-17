<script lang="ts">
	import VirtualList from "svelte-tiny-virtual-list";
	import { Badge } from "$lib/components/ui/badge";
	import * as Popover from "$lib/components/ui/popover";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";
	import { Separator } from "$lib/components/ui/separator";
	import type { CalculatedReponse } from "$lib/types";
	import { parseSeconds, readableTime } from "$lib/time";

	export let calculated: CalculatedReponse["mediaTimes"];

	let sortMode: "rewatches" | "diff" | "watchTime" = "rewatches";
	$: sorted = calculated.toSorted((e1, e2) => {
		switch (sortMode) {
			case "diff":
				return e2.time.diff - e1.time.diff;
			case "rewatches":
				return e2.rewatches - e1.rewatches;
			case "watchTime":
				return e2.time.withoutRewatches - e1.time.withoutRewatches;
		}
	});
</script>

<div class="grid gap-2">
	<div class="flex items-center gap-4">
		<p class="font-medium">Sort:</p>
		<ToggleGroup.Root type="single" bind:value={sortMode}>
			<ToggleGroup.Item value="rewatches">Rewatches</ToggleGroup.Item>
			<ToggleGroup.Item value="watchTime">Watch Time</ToggleGroup.Item>
			<ToggleGroup.Item value="diff">Rewatch Time</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
	<Separator />
	<VirtualList
		width="100%"
		height={window.innerHeight - 384}
		itemCount={sorted.length}
		itemSize={128}
	>
		<div slot="item" let:index let:style {style}>
			{@const { media, rewatches, time } = sorted[index]}
			{@const watchTime = readableTime(parseSeconds(time.withoutRewatches * 60))}
			{@const diffTime = time.diff > 0 ? readableTime(parseSeconds(time.diff * 60)) : null}
			<div class="my-2 flex items-center gap-2" style="--media-color:{media.coverImage.color}">
				<img
					src={media.coverImage.extraLarge}
					alt="Key visual"
					class="aspect-[2/3] w-20 flex-none rounded bg-[var(--media-color)] object-cover object-center"
				/>
				<div class="flex flex-1 flex-col gap-2">
					<h3 class="line-clamp-2 text-lg font-medium">{media.title.romaji}</h3>
					<div class="flex gap-2">
						{watchTime}
						{#if diffTime}
							<Popover.Root>
								<Popover.Trigger>
									<Badge>+{diffTime} (x{rewatches})</Badge>
								</Popover.Trigger>
								<Popover.Content side="top">
									<p>Time spent rewatching</p>
								</Popover.Content>
							</Popover.Root>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</VirtualList>
</div>

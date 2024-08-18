<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import {
		type MediaType,
		ActivityMediaSearchDocument,
		type ActivityMediaSearchQuery
	} from "$lib/anilist";
	import { cn } from "$lib/utils.js";
	import * as Command from "$lib/components/ui/command";
	import { Button } from "$lib/components/ui/button";
	import * as Popover from "$lib/components/ui/popover";
	import { debounce } from "radash";
	import request from "graphql-request";

	const debouncedSearch = debounce({ delay: 500 }, searchMedia);

	export let value = "";
	export let mediaType: MediaType;

	let open = false;
	let searchValue = "";
	let results: ActivityMediaSearchQuery["Page"]["media"] = [];
	let fetchingResults = false;

	$: selectedValue = results.find((e) => e.id === Number(value))?.title?.romaji || "Select a media";
	$: searchValue && debouncedSearch();

	async function closeAndFocusTrigger(triggerId: string) {
		open = false;
		await tick();
		document.getElementById(triggerId)?.focus();
	}

	async function searchMedia() {
		try {
			fetchingResults = true;
			const response = await request<ActivityMediaSearchQuery>(
				"https://graphql.anilist.co",
				ActivityMediaSearchDocument,
				{
					search: searchValue,
					type: mediaType
				}
			);

			results = response.Page.media;
			fetchingResults = false;
		} catch (e) {
			console.log(e);
			results = [];
			fetchingResults = false;
		}
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-full justify-between"
		>
			{selectedValue}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="max-h-96 w-[400px] overflow-y-scroll p-0">
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search media..." bind:value={searchValue} />
			<Command.Empty>No media found.</Command.Empty>
			<Command.Group>
				{#each results as result}
					<Command.Item
						class={cn("flex items-center gap-2", value === result.id.toString() && "bg-accent/80")}
						value={result.id.toString()}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<img
							src={result.coverImage.large}
							alt="Key visual"
							class="bg-foreground-muted aspect-[2/3] w-14 flex-none rounded-md object-cover object-center"
						/>
						<p class="line-clamp-3 w-full">{result.title.romaji}</p>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import {
		type MediaType,
		ActivityMediaSearchDocument,
		type ActivityMediaSearchQuery
	} from "$lib/anilist";
	import { cn } from "$lib/utils";
	import * as Command from "$lib/components/ui/command";
	import { Button } from "$lib/components/ui/button";
	import * as Popover from "$lib/components/ui/popover";
	import { debounce } from "radash";
	import request from "graphql-request";

	const debouncedSearch = debounce({ delay: 500 }, searchMedia);

	interface Props {
		value?: string;
		mediaType: MediaType;
	}

	let { value = $bindable(""), mediaType }: Props = $props();

	let open = $state(false);
	let searchValue = $state("");
	let results: ActivityMediaSearchQuery["Page"]["media"] = $state([]);
	let fetchingResults = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	$effect.pre(() => searchValue && debouncedSearch());

	const selectedValue = $derived(results.find((e) => e.id === Number(value))?.title?.romaji);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
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

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class="w-[200px] justify-between"
				{...props}
				role="combobox"
				aria-expanded={open}
			>
				{selectedValue || "Select a media"}
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="max-h-96 w-[400px] overflow-y-scroll p-0">
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search media..." bind:value={searchValue} />
			<Command.List>
				<Command.Empty>No media found.</Command.Empty>
				<Command.Group>
					{#each results as result (result.id)}
						<Command.Item
							class={cn(
								"flex items-center gap-2",
								value === result.id.toString() && "bg-accent/80"
							)}
							value={result.id.toString()}
							onSelect={() => {
								value = result.id.toString();
								closeAndFocusTrigger();
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
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

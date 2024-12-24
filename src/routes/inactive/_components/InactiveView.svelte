<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import { MediaListStatus, MediaType } from "$lib/anilist";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { buttonVariants } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";
	import type { InactiveEntry, InactiveMediaUser } from "../+page.svelte";
	import MediaView from "./MediaView.svelte";
	import { cn } from "$lib/utils";

	interface Props {
		entries: InactiveEntry[];
		user: InactiveMediaUser;
		mediaType: MediaType;
	}

	let { entries, user, mediaType }: Props = $props();

	const inactiveCutoffSelections = [
		{ value: "1m", label: "1 month" },
		{ value: "2m", label: "2 months" },
		{ value: "3m", label: "3 months" },
		{ value: "6m", label: "6 months" },
		{ value: "1y", label: "1 year" },
		{ value: "2y", label: "2 years" }
	];

	let inactiveCutoff: (typeof inactiveCutoffSelections)[number]["value"] = $state("3m");
	let includeStatus: MediaListStatus[] = $state([
		MediaListStatus.CURRENT,
		MediaListStatus.REPEATING,
		MediaListStatus.PAUSED
	]);
	let triggerContent = $derived(
		inactiveCutoffSelections.find((e) => e.value === inactiveCutoff)?.label ?? "Select a cutoff"
	);

	function getInactiveOffset(cutoff: typeof inactiveCutoff) {
		switch (cutoff) {
			case "1m":
				return 30 * 24 * 60 * 60 * 1000;
			case "2m":
				return 60 * 24 * 60 * 60 * 1000;
			case "3m":
				return 90 * 24 * 60 * 60 * 1000;
			case "6m":
				return 180 * 24 * 60 * 60 * 1000;
			case "1y":
				return 365 * 24 * 60 * 60 * 1000;
			case "2y":
				return 730 * 24 * 60 * 60 * 1000;
		}
	}

	let inactiveEntries = $derived(
		entries
			.filter(
				(e) =>
					Date.now() - new Date(e.updatedAt * 1000).getTime() > getInactiveOffset(inactiveCutoff)
			)
			.filter((e) => includeStatus.includes(e.status))
			.sort((a, b) => a.updatedAt - b.updatedAt)
	);
</script>

<Collapsible.Root class="grid gap-4">
	<div class="flex flex-col space-y-1">
		<Label for="mediaType">Inactive Time</Label>
		<Select.Root type="single" bind:value={inactiveCutoff} items={inactiveCutoffSelections}>
			<Select.Trigger class="w-full">
				{triggerContent}
			</Select.Trigger>
			<Select.Content class="w-full">
				<Select.Group>
					{#each inactiveCutoffSelections as { value, label }}
						<Select.Item {value} {label}>{label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex flex-col space-y-1">
		<Label for="mediaType">Include Status</Label>
		<ToggleGroup.Root type="multiple" bind:value={includeStatus} class="grid grid-cols-4">
			<ToggleGroup.Item value={MediaListStatus.CURRENT}>Current</ToggleGroup.Item>
			<ToggleGroup.Item value={MediaListStatus.REPEATING}>Repeating</ToggleGroup.Item>
			<ToggleGroup.Item value={MediaListStatus.PLANNING}>Planning</ToggleGroup.Item>
			<ToggleGroup.Item value={MediaListStatus.PAUSED}>Paused</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
	<UserHeader name={user.name} avatar={user.avatar.large}>
		<!-- @migration-task: migrate this slot by hand, `below-name` is an invalid identifier -->
		{#snippet belowName()}
			<div class="flex gap-2">
				{inactiveEntries.length} inactive entries
			</div>
		{/snippet}
		{#snippet actions()}
			<Collapsible.Trigger
				class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
			>
				<ChevronsUpDown />
				<span class="sr-only">Toggle</span>
			</Collapsible.Trigger>
		{/snippet}
	</UserHeader>
	<Collapsible.Content>
		<MediaView entries={inactiveEntries} {mediaType} />
	</Collapsible.Content>
</Collapsible.Root>

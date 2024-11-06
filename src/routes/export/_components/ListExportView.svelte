<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import Download from "lucide-svelte/icons/download";
	import { onMount } from "svelte";
	import { MediaType } from "$lib/anilist";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import type { ExportEntry, ExportUser } from "../+page.svelte";
	import SkippedView from "./SkippedView.svelte";
	import { createCSVExport, createMyAnimeListExport } from "../_exporters";
	import { cn } from "$lib/utils";

	interface Props {
		entries: ExportEntry[];
		user: ExportUser;
		mediaType: MediaType;
		updateOnImport: boolean;
		exportFormat: "mal" | "csv";
	}

	let { entries, user, mediaType, updateOnImport, exportFormat }: Props = $props();

	let exportedData: string = "";
	let skippedEntries: ExportEntry[] = $state([]);

	function createExport() {
		switch (exportFormat) {
			case "mal":
				const exportData = createMyAnimeListExport(entries, user, mediaType, updateOnImport);
				exportedData = exportData[0];
				skippedEntries = exportData[1];
				break;
			case "csv":
				exportedData = createCSVExport(entries, mediaType);
				skippedEntries = [];
				break;
		}
	}

	function saveExport() {
		let mimeType: string;
		let extension: string;

		switch (exportFormat) {
			case "mal":
				mimeType = "text/xml";
				extension = "xml";
				break;
			case "csv":
				mimeType = "text/csv";
				extension = "csv";
				break;
		}

		const blob = new Blob([exportedData], {
			type: mimeType
		});
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = `${user.name}_${mediaType.toLowerCase()}_export_${new Date().getTime()}.${extension}`;
		a.click();
	}

	onMount(() => {
		createExport();
	});
</script>

<Collapsible.Root class="grid gap-4">
	<UserHeader name={user.name} avatar={user.avatar.large}>
		{#snippet belowName()}
			<div class="flex gap-2">
				{#if skippedEntries.length}
					<p class="text-sm">
						{skippedEntries.length} entries were skipped due to missing MAL mapping. Expand to view.
					</p>
				{/if}
			</div>
		{/snippet}
		{#snippet actions()}
			<div class="flex gap-2">
				<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => saveExport()}>
					<Download />
					<span class="sr-only">Download</span>
				</Button>
				{#if skippedEntries.length}
					<Collapsible.Trigger
						class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
					>
						<ChevronsUpDown />
						<span class="sr-only">Toggle</span>
					</Collapsible.Trigger>
				{/if}
			</div>
		{/snippet}
	</UserHeader>
	<Collapsible.Content>
		<SkippedView skipped={skippedEntries} />
	</Collapsible.Content>
</Collapsible.Root>

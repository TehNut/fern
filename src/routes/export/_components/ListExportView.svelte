<script lang="ts">
	import { XMLBuilder } from "fast-xml-parser";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import Download from "lucide-svelte/icons/download";
	import { fork } from "radash";
	import { onMount } from "svelte";
	import { MediaListStatus, MediaType, type FuzzyDate } from "$lib/anilist";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import type { ExportEntry, ExportUser } from "../+page.svelte";
	import SkippedView from "./SkippedView.svelte";
	import { createCSVExport, createMyAnimeListExport } from "../_exporters";

	export let entries: ExportEntry[];
	export let user: ExportUser;
	export let mediaType: MediaType;
	export let updateOnImport: boolean;
	export let exportFormat: "mal" | "csv";

	let exportedData: string = "";
	let skippedEntries: ExportEntry[] = [];

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
		<div class="flex gap-2" slot="below-name">
			{#if skippedEntries.length}
				<p class="text-sm">
					{skippedEntries.length} entries were skipped due to missing MAL mapping. Expand to view.
				</p>
			{/if}
		</div>
		<div class="flex gap-2" slot="actions">
			<Button variant="ghost" size="icon" class="h-8 w-8" on:click={() => saveExport()}>
				<Download />
				<span class="sr-only">Download</span>
			</Button>
			{#if skippedEntries.length}
				<Collapsible.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8">
						<ChevronsUpDown />
						<span class="sr-only">Toggle</span>
					</Button>
				</Collapsible.Trigger>
			{/if}
		</div>
	</UserHeader>
	<Collapsible.Content>
		<SkippedView skipped={skippedEntries} />
	</Collapsible.Content>
</Collapsible.Root>

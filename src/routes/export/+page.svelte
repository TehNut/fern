<script lang="ts" context="module">
	import type { GetExportListMlcQuery } from "$lib/anilist";

	export type ExportUser = GetExportListMlcQuery["MediaListCollection"]["user"];
	export type ExportEntry = GetExportListMlcQuery["MediaListCollection"]["lists"][0]["entries"][0];
</script>

<script lang="ts">
	import request from "graphql-request";
	import { toast } from "svelte-sonner";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import { MediaType, GetExportListMlcDocument } from "$lib/anilist";
	import FeatureWrapper from "$lib/components/FeatureWrapper.svelte";
	import * as Alert from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Switch } from "$lib/components/ui/switch";
	import * as Tabs from "$lib/components/ui/tabs";
	import { unique } from "radash";
	import ListExportView from "./_components/ListExportView.svelte";

	let calculatePromise: Promise<{
		user: ExportUser;
		entries: ExportEntry[];
	}> = null;
	let username: string = null;
	let mediaType: MediaType = MediaType.ANIME;
	let updateOnImport: boolean = false;

	async function calculate() {
		calculatePromise = new Promise(async (resolve, reject) => {
			try {
				const data = await request<GetExportListMlcQuery>(
					"https://graphql.anilist.co",
					GetExportListMlcDocument,
					{
						username,
						type: mediaType
					}
				);
				const entries = unique(
					data.MediaListCollection.lists.flatMap((list) => list.entries),
					(e) => e.media.id
				);

				resolve({ user: data.MediaListCollection.user, entries });
			} catch (e) {
				toast(`Error fetching list: ${e.message || String(e)}`);
				reject("Uh-oh :(");
			}
		});
	}
</script>

<svelte:head>
	<title>Fern | List Export</title>
</svelte:head>

<FeatureWrapper>
	<Card.Root class="w-full max-w-lg overflow-hidden">
		<Card.Header>
			<Card.Title>List Export</Card.Title>
			<Card.Description class="text-card-foreground">
				Export your anime or manga list from AniList to a MAL compatible XML file.
			</Card.Description>
		</Card.Header>
		<Card.Content class="relative">
			{#if calculatePromise}
				{#await calculatePromise}
					Fetching list...
				{:then { user, entries }}
					<ListExportView {user} {entries} {mediaType} {updateOnImport} />
				{:catch}
					<div class="grid w-full items-center gap-4">
						<p>Uh-oh :(</p>
						<Button variant="destructive" on:click={() => (calculatePromise = null)}>Reset</Button>
					</div>
				{/await}
			{:else}
				<div class="grid w-full items-center gap-4">
					<Alert.Root>
						<CircleAlert class="size-4" />
						<Alert.Title>Private accounts and entries</Alert.Title>
						<Alert.Description>
							Only publicly available data can be used:
							<ul class="ml-5 list-disc">
								<li>If your account is private, your list cannot be fetched.</li>
								<li>If you have private entries, they will not be accounted for.</li>
							</ul>
						</Alert.Description>
					</Alert.Root>

					<Alert.Root>
						<CircleAlert class="size-4" />
						<Alert.Title>Lossy process</Alert.Title>
						<Alert.Description>
							Exports like this are not completely accurate. Certain data, such as custom lists,
							will be lost.
						</Alert.Description>
					</Alert.Root>

					<div class="flex flex-col space-y-1">
						<Label for="username">AniList Username</Label>
						<Input
							id="username"
							placeholder="AniListUser"
							bind:value={username}
							data-1p-ignore
							data-lpignore
						/>
					</div>

					<div class="flex w-full flex-col space-y-1">
						<Label for="mediaType">Media Type</Label>
						<Tabs.Root bind:value={mediaType} class="w-full">
							<Tabs.List class="grid w-full grid-cols-2">
								<Tabs.Trigger value={MediaType.ANIME}>Anime</Tabs.Trigger>
								<Tabs.Trigger value={MediaType.MANGA}>Manga</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					</div>

					<div class="flex w-full items-center gap-4">
						<Switch bind:checked={updateOnImport} />
						<Label for="mediaType">Update on import</Label>
					</div>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			{#if calculatePromise === null}
				<Button on:click={calculate} disabled={!username}>Export</Button>
			{:else}
				<Button
					on:click={() => {
						username = null;
						calculatePromise = null;
					}}
				>
					Go again!
				</Button>
			{/if}
		</Card.Footer>
	</Card.Root>
</FeatureWrapper>

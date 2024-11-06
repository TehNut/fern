<script lang="ts" module>
	import { MediaType, type InactiveMediaMlcQuery } from "$lib/anilist";

	export type InactiveEntry =
		InactiveMediaMlcQuery["MediaListCollection"]["lists"][0]["entries"][0];
	export type InactiveMediaUser = InactiveMediaMlcQuery["MediaListCollection"]["user"];
</script>

<script lang="ts">
	import { unique } from "radash";
	import request from "graphql-request";
	import { toast } from "svelte-sonner";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import { InactiveMediaMlcDocument } from "$lib/anilist";
	import * as Alert from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Tabs from "$lib/components/ui/tabs";
	import FeatureWrapper from "$lib/components/FeatureWrapper.svelte";
	import InactiveView from "./_components/InactiveView.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";

	let calculatePromise: Promise<{
		entries: InactiveEntry[];
		user: InactiveMediaUser;
	}> = $state(null);
	let username: string = $state(null);
	let mediaType: MediaType = $state(MediaType.ANIME);

	async function calculate() {
		calculatePromise = new Promise(async (resolve, reject) => {
			try {
				const data = await request<InactiveMediaMlcQuery>(
					"https://graphql.anilist.co",
					InactiveMediaMlcDocument,
					{
						username,
						type: mediaType
					}
				);
				const entries = unique(
					data.MediaListCollection.lists.flatMap((list) => list.entries),
					(m) => m.media.id
				);

				resolve({ entries, user: data.MediaListCollection.user });
			} catch (e) {
				toast(`Error calculating watch time: ${e.message || String(e)}`);
				reject("Uh-oh :(");
			}
		});
	}
</script>

<MetaTags title="Inactive Entries" />

<FeatureWrapper>
	<Card.Root class="overflow-hidden">
		<Card.Header>
			<Card.Title>Inactive Entries</Card.Title>
			<Card.Description class="text-card-foreground">
				Find list entries that have not been updated in a while.
			</Card.Description>
		</Card.Header>
		<Card.Content class="relative">
			{#if calculatePromise}
				{#await calculatePromise}
					Calculating...
				{:then { entries, user }}
					<InactiveView {entries} {user} />
				{:catch}
					<div class="grid w-full items-center gap-4">
						<p>Uh-oh :(</p>
						<Button variant="destructive" onclick={() => (calculatePromise = null)}>Reset</Button>
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
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			{#if calculatePromise === null}
				<Button onclick={calculate} disabled={!username}>Calculate</Button>
			{:else}
				<Button
					onclick={() => {
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

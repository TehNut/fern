<script lang="ts">
	import { unique } from "radash";
	import { toast } from "svelte-sonner";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import { calculateWatchTime, LIST_QUERY, queryAniList } from "$lib";
	import * as Alert from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import type { AniListResponse, CalculatedReponse, User } from "$lib/types";
	import CalculatedView from "./_components/CalculatedView.svelte";
	import FeatureWrapper from "$lib/components/FeatureWrapper.svelte";

	let calculatePromise: Promise<{ calculated: CalculatedReponse; user: User }> = null;
	let username: string = null;

	async function calculate() {
		calculatePromise = new Promise(async (resolve, reject) => {
			try {
				const { data } = await queryAniList<AniListResponse>(LIST_QUERY, { username });
				const entries = unique(
					data.MediaListCollection.lists.flatMap((list) => list.entries),
					(e) => e.media.id
				);
				const watchTime = calculateWatchTime(entries);
				resolve({ calculated: watchTime, user: data.MediaListCollection.user });
			} catch (e) {
				toast(`Error calculating watch time: ${e.message || String(e)}`);
				reject("Uh-oh :(");
			}
		});
	}
</script>

<FeatureWrapper>
	<Card.Root class="relative w-full max-w-lg overflow-hidden">
		<div
			class="absolute inset-0 h-2/5 max-h-52 bg-cover bg-center"
			style="background-image: url(https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg);"
		>
			<div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black backdrop-blur-sm" />
		</div>
		<Card.Header class="relative">
			<Card.Title>Repeatless Watch Time</Card.Title>
			<Card.Description class="text-card-foreground">
				Calculate your total watch time excluding rewatches.
			</Card.Description>
		</Card.Header>
		<Card.Content class="relative">
			{#if calculatePromise}
				{#await calculatePromise}
					Calculating...
				{:then { calculated, user }}
					<CalculatedView {calculated} {user} />
				{:catch}
					<div class="grid gap-4">
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

					<div class="5 flex flex-col space-y-1">
						<Label for="username">AniList Username</Label>
						<Input
							id="username"
							placeholder="AniListUser"
							bind:value={username}
							data-1p-ignore
							data-lpignore
						/>
					</div>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			{#if calculatePromise === null}
				<Button on:click={calculate} disabled={!username}>Calculate</Button>
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

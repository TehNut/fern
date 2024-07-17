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
	import CalculatedView from "./CalculatedView.svelte";

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

<Card.Root>
	<Card.Header>
		<Card.Title>Repeatless Watch Time</Card.Title>
		<Card.Description>Calculate your total watch time excluding rewatches.</Card.Description>
	</Card.Header>
	<Card.Content>
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

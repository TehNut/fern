<script lang="ts" context="module">
	import type { RepeatlessWatchTimeMlcQuery } from "$lib/anilist";

	export type RepeatlessUser = RepeatlessWatchTimeMlcQuery["MediaListCollection"]["user"];
	export type RepeatlessMedia =
		RepeatlessWatchTimeMlcQuery["MediaListCollection"]["lists"][0]["entries"][0]["media"];
	export type CalculatedTime = {
		withoutRewatches: number;
		withRewatches: number;
		diff: number;
	};

	export type CalculatedReponse = {
		time: CalculatedTime;
		mediaTimes: {
			media: RepeatlessMedia;
			rewatches: number;
			time: CalculatedTime;
		}[];
	};
</script>

<script lang="ts">
	import { unique } from "radash";
	import { toast } from "svelte-sonner";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import * as Alert from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import CalculatedView from "./_components/CalculatedView.svelte";
	import FeatureWrapper from "$lib/components/FeatureWrapper.svelte";
	import request from "graphql-request";
	import { RepeatlessWatchTimeMlcDocument } from "$lib/anilist";

	let calculatePromise: Promise<{
		calculated: CalculatedReponse;
		user: RepeatlessUser;
	}> = null;
	let username: string = null;

	async function calculate() {
		calculatePromise = new Promise(async (resolve, reject) => {
			try {
				const data = await request<RepeatlessWatchTimeMlcQuery>(
					"https://graphql.anilist.co",
					RepeatlessWatchTimeMlcDocument
				);
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

	export function calculateWatchTime(
		entries: RepeatlessWatchTimeMlcQuery["MediaListCollection"]["lists"][0]["entries"]
	): CalculatedReponse {
		const result: CalculatedReponse = {
			time: {
				withRewatches: 0,
				withoutRewatches: 0,
				diff: 0
			},
			mediaTimes: []
		};

		for (const entry of entries) {
			const withRewatches =
				(entry.repeat * entry.media.episodes + entry.progress) * entry.media.duration;
			const withoutRewatches = entry.progress * entry.media.duration;
			const diff = withRewatches - withoutRewatches;

			result.time.withRewatches += withRewatches;
			result.time.withoutRewatches += withoutRewatches;
			result.time.diff += diff;
			result.mediaTimes.push({
				media: entry.media,
				rewatches: entry.repeat,
				time: {
					withRewatches,
					withoutRewatches,
					diff
				}
			});
		}

		return result;
	}
</script>

<FeatureWrapper>
	<Card.Root class="w-full max-w-lg overflow-hidden">
		<Card.Header>
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

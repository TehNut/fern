<script lang="ts" module>
	import type { ActivitySearchQuery } from "$lib/anilist";

	export type ListActivity = Extract<
		ActivitySearchQuery["Page"]["activities"][0],
		{ __typename?: "ListActivity" }
	>;
</script>

<script lang="ts">
	import { today, getLocalTimeZone, DateFormatter, type DateValue } from "@internationalized/date";
	import type { DateRange } from "bits-ui";
	import request from "graphql-request";
	import CircleAlert from "lucide-svelte/icons/circle-alert";
	import Calendar from "lucide-svelte/icons/calendar";
	import { toast } from "svelte-sonner";
	import {
		MediaType,
		GetUserDocument,
		ActivitySearchDocument,
		type GetUserQuery
	} from "$lib/anilist";
	import FeatureWrapper from "$lib/components/FeatureWrapper.svelte";
	import * as Alert from "$lib/components/ui/alert";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Popover from "$lib/components/ui/popover";
	import { RangeCalendar } from "$lib/components/ui/range-calendar";
	import * as Tabs from "$lib/components/ui/tabs";
	import ActivityView from "./_components/ActivityView.svelte";
	import { browser } from "$app/environment";
	import MediaSearch from "./_components/MediaSearch.svelte";
	import Switch from "$lib/components/ui/switch/switch.svelte";
	import { cn } from "$lib/utils";
	import MetaTags from "$lib/components/MetaTags.svelte";

	const rangeStart = today(getLocalTimeZone());
	const rangeEnd = rangeStart;
	const df = new DateFormatter((browser && navigator.languages[0]) || "en-US", {
		dateStyle: "short"
	});

	let calculatePromise: Promise<{
		activities: ListActivity[];
		user: GetUserQuery["User"];
		hasMore: boolean;
	}> = $state(null);
	let username: string = $state(null);
	let mediaTypeIsManga = $state(false);
	let mediaId = $state<string>("");
	let selectionType = $state<"time" | "media">("time");
	let value = $state<DateRange | undefined>({
		start: rangeStart,
		end: rangeEnd
	});
	let startValue = $state<DateValue | undefined>(undefined);

	async function calculate() {
		calculatePromise = new Promise(async (resolve, reject) => {
			try {
				const userData = await request<GetUserQuery>(
					"https://graphql.anilist.co",
					GetUserDocument,
					{
						name: username
					}
				);
				const activities = await request<ActivitySearchQuery>(
					"https://graphql.anilist.co",
					ActivitySearchDocument,
					{
						page: 1,
						userId: userData.User.id,
						mediaId: selectionType === "media" ? mediaId : undefined,
						createdLesser:
							selectionType === "time"
								? Math.floor(value.end.toDate(getLocalTimeZone()).getTime() / 1000 + 60 * 60 * 24)
								: undefined,
						createdGreater:
							selectionType === "time"
								? Math.floor(value.start.toDate(getLocalTimeZone()).getTime() / 1000)
								: undefined
					}
				);

				resolve({
					activities: activities.Page.activities as ListActivity[],
					user: userData.User,
					hasMore: activities.Page.pageInfo.hasNextPage
				});
			} catch (e) {
				toast(`Error fetching activities: ${e.message || String(e)}`);
				reject("Uh-oh :(");
			}
		});
	}
</script>

<MetaTags title="Activity History" />

<FeatureWrapper>
	<Card.Root class="overflow-hidden">
		<Card.Header>
			<Card.Title>Activity History</Card.Title>
			<Card.Description class="text-card-foreground"
				>View your activity history for a given time period or media entry.</Card.Description
			>
		</Card.Header>
		<Card.Content class="relative">
			{#if calculatePromise}
				{#await calculatePromise}
					Fetching activities...
				{:then { activities, user, hasMore }}
					<ActivityView
						{activities}
						{user}
						{hasMore}
						value={selectionType === "time" ? value : undefined}
						mediaId={selectionType === "media" ? mediaId : undefined}
					/>
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

					<div class="flex flex-col space-y-1">
						<Label>Search Method</Label>
						<Tabs.Root bind:value={selectionType} class="w-full">
							<Tabs.List class="mb-4 grid w-full grid-cols-2">
								<Tabs.Trigger value="time">Date Range</Tabs.Trigger>
								<Tabs.Trigger value="media">Media</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="time">
								<div class="flex flex-col space-y-1">
									<Label>Activity Date Range</Label>
									<Popover.Root>
										<Popover.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full")}>
											<Calendar class="mr-2 size-4" />
											{#if value && value.start}
												{#if value.end && value.start.compare(value.end) !== 0}
													{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
														value.end.toDate(getLocalTimeZone())
													)}
												{:else}
													{df.format(value.start.toDate(getLocalTimeZone()))}
												{/if}
											{:else if startValue}
												{df.format(startValue.toDate(getLocalTimeZone()))}
											{:else}
												Pick a date
											{/if}
										</Popover.Trigger>
										<Popover.Content side="top">
											<RangeCalendar bind:value />
										</Popover.Content>
									</Popover.Root>
								</div>
							</Tabs.Content>
							<Tabs.Content value="media">
								<div class="flex flex-col gap-4">
									<div class="flex gap-2">
										<p>Anime</p>
										<Switch
											bind:checked={mediaTypeIsManga}
											class="data-[state=unchecked]:bg-primary"
										/>
										<p>Manga</p>
									</div>
									<div class="flex flex-col space-y-1">
										<Label>Search</Label>
										<MediaSearch
											bind:value={mediaId}
											mediaType={mediaTypeIsManga ? MediaType.MANGA : MediaType.ANIME}
										/>
									</div>
								</div>
							</Tabs.Content>
						</Tabs.Root>
					</div>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			{#if calculatePromise === null}
				<Button onclick={calculate} disabled={!username}>Search</Button>
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

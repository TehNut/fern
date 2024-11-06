<script lang="ts">
	import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
	import type { DateRange } from "bits-ui";
	import request from "graphql-request";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import ExternalLink from "lucide-svelte/icons/external-link";
	import { capitalize } from "radash";
	import { toast } from "svelte-sonner";
	import VirtualList from "svelte-tiny-virtual-list";
	import { browser } from "$app/environment";
	import {
		ActivitySearchDocument,
		type ActivitySearchQuery,
		type GetUserQuery
	} from "$lib/anilist";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import type { ListActivity } from "../+page.svelte";
	import { cn } from "$lib/utils";

	interface Props {
		activities: ListActivity[];
		user: GetUserQuery["User"];
		value: DateRange;
		hasMore?: boolean;
		mediaId?: string | undefined;
	}

	let {
		activities = $bindable(),
		user,
		value,
		hasMore = $bindable(true),
		mediaId = undefined
	}: Props = $props();

	const df = new DateFormatter((browser && navigator.languages[0]) || "en-US", {
		dateStyle: "short"
	});
	const dfTime = new DateFormatter((browser && navigator.languages[0]) || "en-US", {
		dateStyle: "short",
		timeStyle: "short"
	});

	let page = 1;
	let isLoading = $state(false);

	async function loadMore() {
		if (!hasMore) return;

		isLoading = true;
		page += 1;

		try {
			const response = await request<ActivitySearchQuery>(
				"https://graphql.anilist.co",
				ActivitySearchDocument,
				{
					page,
					userId: user.id,
					mediaId,
					createdLesser: value
						? Math.floor(value.end.toDate(getLocalTimeZone()).getTime() / 1000 + 60 * 60 * 24)
						: undefined,
					createdGreater: value
						? Math.floor(value.start.toDate(getLocalTimeZone()).getTime() / 1000)
						: undefined
				}
			);
			page++;
			isLoading = false;
			hasMore = response.Page.pageInfo.hasNextPage;
			activities = [...activities, ...(response.Page.activities as ListActivity[])];
		} catch (e) {
			isLoading = false;
			toast(`Error fetching activities: ${e.message || String(e)}`);
		}
	}
</script>

<Collapsible.Root class="grid gap-4">
	<UserHeader name={user.name} avatar={user.avatar.large}>
		{#snippet belowName()}
			<div class="flex gap-2">
				{#if value}
					{#if value.start.compare(value.end) === 0}
						These {activities.length}{activities.length % 50 === 0 ? `+` : ""} activities were created
						on
						{df.format(value.start.toDate(getLocalTimeZone()))}.
					{:else}
						These {activities.length}{activities.length % 50 === 0 ? `+` : ""} activities were created
						between
						{df.format(value.start.toDate(getLocalTimeZone()))}
						and
						{df.format(value.end.toDate(getLocalTimeZone()))}.
					{/if}
				{:else}
					These {activities.length}{activities.length % 50 === 0 ? `+` : ""} activities were created
					for this media.
				{/if}
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
		<VirtualList
			width="100%"
			height={window.innerHeight - 384}
			itemCount={activities.length + (hasMore ? 1 : 0)}
			itemSize={128}
		>
			<div slot="item" let:index let:style {style}>
				{@const activity = index === activities.length ? null : activities[index]}
				{#if activity}
					<div
						class="my-2 flex h-full items-center gap-2"
						style:--media-color={activity.media.coverImage.color}
					>
						<a
							href="https://anilist.co/{activity.media.type.toLowerCase()}/{activity.media.id}"
							target="_blank"
							class="w-20 flex-none"
						>
							<img
								src={activity.media.coverImage.extraLarge}
								alt="Key visual"
								class="aspect-[2/3] flex-none rounded bg-[var(--media-color)] object-cover object-center"
							/>
						</a>
						<div class="flex h-full flex-1 flex-col justify-between py-2">
							<p class="line-clamp-3 flex-1">
								{capitalize(activity.status)}
								{activity.progress ? `${activity.progress} of` : ""}
								<a
									href="https://anilist.co/{activity.media.type.toLowerCase()}/{activity.media.id}"
									target="_blank"
									class="font-medium text-[var(--media-color)]"
								>
									{activity.media.title.romaji}
								</a>
							</p>
							<div class="flex h-10 flex-none items-center justify-between pr-4">
								<p class="text-sm">{dfTime.format(new Date(activity.createdAt * 1000))}</p>
								<Button
									href="https://anilist.co/activity/{activity.id}"
									variant="ghost"
									size="icon"
									target="_blank"
								>
									<ExternalLink />
								</Button>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex h-full w-full items-center justify-center">
						<Button onclick={loadMore} disabled={isLoading}>Load More</Button>
					</div>
				{/if}
			</div>
		</VirtualList>
	</Collapsible.Content>
</Collapsible.Root>

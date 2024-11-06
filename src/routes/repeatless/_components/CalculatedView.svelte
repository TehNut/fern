<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { buttonVariants } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Popover from "$lib/components/ui/popover";
	import { parseSeconds, readableTime } from "$lib/time";
	import MediaView from "./MediaView.svelte";
	import type { CalculatedReponse, RepeatlessUser } from "../+page.svelte";
	import { cn } from "$lib/utils";

	interface Props {
		calculated: CalculatedReponse;
		user: RepeatlessUser;
	}

	let { calculated, user }: Props = $props();

	let watchTime = $derived(readableTime(parseSeconds(calculated.time.withoutRewatches * 60)));
	let diffTime = $derived(readableTime(parseSeconds(calculated.time.diff * 60)));
</script>

<Collapsible.Root class="grid gap-4">
	<UserHeader name={user.name} avatar={user.avatar.large}>
		{#snippet belowName()}
			<div class="flex gap-2">
				<p>{watchTime}</p>
				<Popover.Root>
					<Popover.Trigger>
						<Badge>+{diffTime}</Badge>
					</Popover.Trigger>
					<Popover.Content side="top">
						<p>Time spent rewatching</p>
					</Popover.Content>
				</Popover.Root>
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
		<MediaView calculated={calculated.mediaTimes} totalTime={calculated.time.withoutRewatches} />
	</Collapsible.Content>
</Collapsible.Root>

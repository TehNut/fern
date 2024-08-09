<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import UserHeader from "$lib/components/UserHeader.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Popover from "$lib/components/ui/popover";
	import { parseSeconds, readableTime } from "$lib/time";
	import MediaView from "./MediaView.svelte";
	import type { CalculatedReponse, RepeatlessUser } from "../+page.svelte";

	export let calculated: CalculatedReponse;
	export let user: RepeatlessUser;

	$: watchTime = readableTime(parseSeconds(calculated.time.withoutRewatches * 60));
	$: diffTime = readableTime(parseSeconds(calculated.time.diff * 60));
</script>

<Collapsible.Root class="grid gap-4">
	<UserHeader name={user.name} avatar={user.avatar.large}>
		<div class="flex gap-2" slot="below-name">
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
		<svelte:fragment slot="actions">
			<Collapsible.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8">
					<ChevronsUpDown />
					<span class="sr-only">Toggle</span>
				</Button>
			</Collapsible.Trigger>
		</svelte:fragment>
	</UserHeader>
	<Collapsible.Content>
		<MediaView calculated={calculated.mediaTimes} totalTime={calculated.time.withoutRewatches} />
	</Collapsible.Content>
</Collapsible.Root>

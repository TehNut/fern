<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Popover from "$lib/components/ui/popover";
	import { parseSeconds, readableTime } from "$lib/time";
	import type { CalculatedReponse } from "$lib/types";
	import MediaView from "./MediaView.svelte";

	export let calculated: CalculatedReponse;

	$: watchTime = readableTime(parseSeconds(calculated.time.withoutRewatches * 60));
	$: diffTime = readableTime(parseSeconds(calculated.time.diff * 60));
</script>

<Collapsible.Root class="grid gap-4">
	<div class="flex items-center justify-between">
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
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="icon">
				<ChevronsUpDown />
				<span class="sr-only">Toggle</span>
			</Button>
		</Collapsible.Trigger>
	</div>
	<Collapsible.Content>
		<MediaView calculated={calculated.mediaTimes} />
	</Collapsible.Content>
</Collapsible.Root>

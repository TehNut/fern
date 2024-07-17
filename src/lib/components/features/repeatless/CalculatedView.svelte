<script lang="ts">
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Popover from "$lib/components/ui/popover";
	import { parseSeconds, readableTime } from "$lib/time";
	import type { CalculatedReponse, User } from "$lib/types";
	import MediaView from "./MediaView.svelte";

	export let calculated: CalculatedReponse;
	export let user: User;

	$: watchTime = readableTime(parseSeconds(calculated.time.withoutRewatches * 60));
	$: diffTime = readableTime(parseSeconds(calculated.time.diff * 60));
</script>

<Collapsible.Root class="grid gap-4">
	<div class="flex items-center gap-4">
		<a href="https://anilist.co/user/{user.name}" target="_blank">
			<Avatar.Root>
				<Avatar.Image
					src={user.avatar.large}
					alt="Profile picture"
					class="object-cover object-center"
				/>
				<Avatar.Fallback class="animate-pulse bg-popover-foreground/10" />
			</Avatar.Root>
		</a>
		<div class="flex w-full flex-col">
			<a href="https://anilist.co/user/{user.name}" target="_blank" class="text-lg font-bold">
				{user.name}
			</a>
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
					<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8">
						<ChevronsUpDown />
						<span class="sr-only">Toggle</span>
					</Button>
				</Collapsible.Trigger>
			</div>
		</div>
	</div>

	<Collapsible.Content>
		<MediaView calculated={calculated.mediaTimes} />
	</Collapsible.Content>
</Collapsible.Root>

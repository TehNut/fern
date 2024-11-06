<script lang="ts">
	import type { Snippet } from "svelte";
	import * as Avatar from "$lib/components/ui/avatar";

	interface Props {
		name: string;
		avatar: string;
		actions: Snippet;
		belowName: Snippet;
	}

	let { avatar, name, actions, belowName }: Props = $props();
</script>

<div class="flex items-center gap-4">
	<a href="https://anilist.co/user/{name}" target="_blank">
		<Avatar.Root>
			<Avatar.Image src={avatar} alt="Profile picture" class="object-cover object-center" />
			<Avatar.Fallback class="animate-pulse bg-popover-foreground/10" />
		</Avatar.Root>
	</a>
	<div class="flex w-full flex-col">
		<a href="https://anilist.co/user/{name}" target="_blank" class="text-lg font-bold">
			{name}
		</a>
		<div class="flex items-center justify-between">
			<div class="flex gap-2">
				{@render belowName?.()}
			</div>
			{@render actions?.()}
		</div>
	</div>
</div>

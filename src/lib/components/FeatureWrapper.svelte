<script lang="ts">
	import ArrowLeftIcon from "lucide-svelte/icons/arrow-left";
	import { Button } from "./ui/button";
	interface Props {
		buttons?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
	}

	let { buttons, children }: Props = $props();
</script>

<div class="my-8 flex w-full max-w-lg flex-col gap-2">
	<div class="flex flex-none items-center justify-between">
		<Button href="/" variant="ghost" size="icon">
			<ArrowLeftIcon />
			<span class="sr-only">Back</span>
		</Button>
		{#if buttons}
			<div class="flex items-center gap-2">
				{@render buttons?.()}
			</div>
		{/if}
	</div>
	{@render children?.()}
</div>

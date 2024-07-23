<script lang="ts">
	import ArrowLeftIcon from "lucide-svelte/icons/arrow-left";
	import { Button } from "./ui/button";
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-none items-center justify-between">
		<Button href="/" variant="ghost" size="icon">
			<ArrowLeftIcon />
			<span class="sr-only">Back</span>
		</Button>
		{#if $$slots.buttons}
			<div class="flex items-center gap-2">
				<slot name="buttons" />
			</div>
		{/if}
	</div>
	<slot />
</div>

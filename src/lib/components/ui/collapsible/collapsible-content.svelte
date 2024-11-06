<script lang="ts">
	import { Collapsible as CollapsiblePrimitive, type WithoutChild } from "bits-ui";
	import { slide } from "svelte/transition";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<CollapsiblePrimitive.ContentProps> = $props();
</script>

<CollapsiblePrimitive.Content bind:ref forceMount class={className} {...restProps}>
	{#snippet child({ props, open })}
		{#if open}
			<div {...props} transition:slide={{ duration: 150 }}>
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</CollapsiblePrimitive.Content>

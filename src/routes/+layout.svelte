<script>
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner";
	import "../app.css";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<Toaster position="top-right" />
<ModeWatcher defaultMode="system" />

<div class="relative flex min-h-screen flex-col">
	<main class="mx-2 flex flex-1 items-center justify-center">
		{@render children?.()}
	</main>
</div>

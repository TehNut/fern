<script>
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner";
	import "../app.css";
</script>

<Toaster position="top-right" />
<ModeWatcher defaultMode="system" />

<div class="relative flex min-h-screen flex-col">
	<main class="flex flex-1 items-center justify-center">
		<slot></slot>
	</main>
</div>

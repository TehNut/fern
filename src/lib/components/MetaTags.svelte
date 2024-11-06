<script lang="ts">
	import { browser } from "$app/environment";
	import { MetaTags } from "svelte-meta-tags";

	interface Props {
		title: string;
		description?: string | undefined;
		image?: string;
	}

	let {
		title,
		description = 'A collection of AniList "nice to have"\'s that are easier to implement externally for now.',
		image = "/fern.png"
	}: Props = $props();
</script>

<MetaTags
	{title}
	{description}
	titleTemplate="Fern · %s"
	openGraph={{
		title,
		description,
		url: browser ? location.href : "https://fern.ignoffo.dev",
		images: [{ url: image }],
		siteName: "Fern"
	}}
/>

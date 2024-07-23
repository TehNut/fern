<script lang="ts">
	import * as Card from "$lib/components/ui/card";

	const features = [
		{
			name: "Repeatless Watch Time",
			description: "Calculate your total watch time excluding rewatches.",
			background: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
			path: "/repeatless"
		}
	];
</script>

<svelte:head>
	<title>Fern</title>
</svelte:head>

<div class="mx-auto flex w-11/12 flex-col gap-4 xl:w-2/3">
	<h1 class="text-2xl font-medium">Features</h1>
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
		{#each features as { name, path, description, background }}
			<a href={path}>
				<Card.Root
					style="background-image: url({background});"
					class="relative overflow-hidden bg-cover bg-center"
				>
					<div class="absolute inset-0 bg-card/60 backdrop-blur-sm" />
					<Card.Header class="relative">
						<Card.Title>{name}</Card.Title>
					</Card.Header>
					<Card.Content class="relative">
						<p>{description}</p>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>
</div>

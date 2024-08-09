<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";

	const features = [
		{
			name: "Repeatless Watch Time",
			description: "Calculate your total watch time excluding rewatches.",
			path: "/repeatless",
			isNew: false
		},
		{
			name: "Find Inactive",
			description: "Find media that has not been updated in a while.",
			path: "/inactive",
			isNew: true
		}
	];
</script>

<svelte:head>
	<title>Fern</title>
</svelte:head>

<div class="mx-auto flex w-11/12 flex-col gap-4 xl:w-2/3">
	<h1 class="text-2xl font-medium">Features</h1>
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
		{#each features as { name, path, description, isNew }}
			<a href={path}>
				<Card.Root class="relative h-full">
					<Card.Header>
						<Card.Title>{name}</Card.Title>
					</Card.Header>
					<Card.Content>
						<p>{description}</p>
					</Card.Content>
					{#if isNew}
						<Badge class="absolute -right-2 -top-2">New</Badge>
					{/if}
				</Card.Root>
			</a>
		{/each}
	</div>
</div>

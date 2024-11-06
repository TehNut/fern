<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";

	const features = [
		{
			name: "List Export",
			description: "Export your anime or manga list from AniList to a MAL compatible XML file.",
			path: "/export",
			isNew: false
		},
		{
			name: "Repeatless Watch Time",
			description: "Calculate your total watch time excluding rewatches.",
			path: "/repeatless",
			isNew: false
		},
		{
			name: "Activity Finder",
			description:
				"Find past activities for specific media or view a specific time period of activity.",
			path: "/activity-finder",
			isNew: true
		},
		{
			name: "Find Inactive",
			description: "Find media that has not been updated in a while.",
			path: "/inactive",
			isNew: false
		}
	];
</script>

<svelte:head>
	<title>Fern | Spellbook</title>
</svelte:head>

<div class="flex w-full flex-col gap-4 lg:mx-auto lg:w-11/12 xl:w-2/3">
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

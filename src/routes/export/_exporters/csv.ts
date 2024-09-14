import { generateCsv, mkConfig, type ColumnHeader } from "export-to-csv";
import type { ExportEntry } from "../+page.svelte";
import { formatDate } from ".";
import { MediaType } from "$lib/anilist";

const headers: ColumnHeader[] = [
	{ key: "anilistId", displayLabel: "AniList ID" },
	{ key: "title", displayLabel: "Title" },
	{ key: "format", displayLabel: "Format" },
	{ key: "status", displayLabel: "Status" },
	{ key: "progress", displayLabel: "Progress" },
	{ key: "progressVolumes", displayLabel: "Volumes" },
	{ key: "repeats", displayLabel: "Repeats" },
	{ key: "score", displayLabel: "Score" },
	{ key: "notes", displayLabel: "Notes" },
	{ key: "startDate", displayLabel: "Start Date" },
	{ key: "completedDate", displayLabel: "Completed Date" }
];

export function createCSVExport(entries: ExportEntry[], mediaType: MediaType): string {
	const csv = generateCsv(mkConfig({
		columnHeaders: headers,
		replaceUndefinedWith: "N/A",
	}))(entries.map(e => {
		return {
			anilistId: e.media.id,
			title: e.media.title.romaji,
			format: e.media.format,
			status: e.status,
			progress: e.progress,
			progressVolumes: mediaType === MediaType.MANGA ? e.progressVolumes || "" : undefined,
			repeats: e.repeat,
			score: e.score,
			notes: e.notes?.replaceAll("\n", "\\n") || "",
			startDate: formatDate(e.startedAt),
			completedDate: formatDate(e.completedAt)
		}
	}));

	return csv + "\n";
}